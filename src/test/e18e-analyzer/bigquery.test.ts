import { describe, it, expect, vi, beforeEach } from "vitest";

const mockExecAsync = vi.fn();
vi.mock("../../../scripts/e18e-analyzer/utils/exec.ts", () => ({
  execAsync: (...args: unknown[]) => mockExecAsync(...args),
}));

const mockCacheGetAll = vi.fn();
const mockCacheSave = vi.fn();
vi.mock("../../../scripts/e18e-analyzer/bigquery-cache.ts", () => ({
  BigQueryCache: vi.fn().mockImplementation(() => ({
    getAll: () => mockCacheGetAll(),
    getFetchedAt: () => "2026-02-14T00:00:00Z",
    save: (...args: unknown[]) => mockCacheSave(...args),
  })),
}));

import {
  dryRunBqQuery,
  executeBqQuery,
  isBqAvailable,
  fetchDirectDependents,
} from "../../../scripts/e18e-analyzer/bigquery.ts";

beforeEach(() => {
  vi.clearAllMocks();
  mockExecAsync.mockReset();
  mockCacheGetAll.mockReset().mockReturnValue(null);
  mockCacheSave.mockReset();
});

describe("executeBqQuery", () => {
  it("parses JSON rows from bq output", async () => {
    const rows = [
      { package: "express", dep: "qs" },
      { package: "webpack", dep: "mkdirp" },
    ];
    mockExecAsync.mockResolvedValue({
      stdout: JSON.stringify(rows),
      stderr: "",
      exitCode: 0,
    });

    const result = await executeBqQuery("SELECT 1");
    expect(result).toEqual(rows);
  });

  it("returns empty array for empty output", async () => {
    mockExecAsync.mockResolvedValue({
      stdout: "[]",
      stderr: "",
      exitCode: 0,
    });

    const result = await executeBqQuery("SELECT 1");
    expect(result).toEqual([]);
  });

  it("returns empty array for whitespace-only output", async () => {
    mockExecAsync.mockResolvedValue({
      stdout: "  \n  ",
      stderr: "",
      exitCode: 0,
    });

    const result = await executeBqQuery("SELECT 1");
    expect(result).toEqual([]);
  });

  it("throws on non-zero exit code", async () => {
    mockExecAsync.mockResolvedValue({
      stdout: "",
      stderr: "Error: query exceeded bytes limit",
      exitCode: 1,
    });

    await expect(executeBqQuery("SELECT 1")).rejects.toThrow(
      "bq query failed (exit 1): Error: query exceeded bytes limit",
    );
  });

  it("passes maximum_bytes_billed to bq CLI args", async () => {
    mockExecAsync.mockResolvedValue({
      stdout: "[]",
      stderr: "",
      exitCode: 0,
    });

    await executeBqQuery("SELECT 1", 5_000_000_000);

    const args = mockExecAsync.mock.calls[0][1] as string[];
    expect(args).toContain("--maximum_bytes_billed=5000000000");
  });

  it("passes SQL as last argument after --", async () => {
    mockExecAsync.mockResolvedValue({
      stdout: "[]",
      stderr: "",
      exitCode: 0,
    });

    await executeBqQuery("SELECT * FROM foo");

    const args = mockExecAsync.mock.calls[0][1] as string[];
    expect(args[args.length - 1]).toBe("SELECT * FROM foo");
    expect(args[args.length - 2]).toBe("--");
  });
});

describe("dryRunBqQuery", () => {
  it("parses bytes from dry run output", async () => {
    mockExecAsync.mockResolvedValue({
      stdout:
        "Query successfully validated. Assuming the tables are not modified, running this query will process 18432000000 bytes of data.\n",
      stderr: "",
      exitCode: 0,
    });

    const bytes = await dryRunBqQuery("SELECT 1");
    expect(bytes).toBe(18432000000);
  });

  it("passes --dry_run flag to bq CLI", async () => {
    mockExecAsync.mockResolvedValue({
      stdout: "running this query will process 100 bytes of data.\n",
      stderr: "",
      exitCode: 0,
    });

    await dryRunBqQuery("SELECT 1");

    const args = mockExecAsync.mock.calls[0][1] as string[];
    expect(args).toContain("--dry_run");
    expect(args).toContain("--use_legacy_sql=false");
  });

  it("throws on non-zero exit code", async () => {
    mockExecAsync.mockResolvedValue({
      stdout: "",
      stderr: "Error: not found",
      exitCode: 1,
    });

    await expect(dryRunBqQuery("SELECT 1")).rejects.toThrow(
      "bq dry run failed (exit 1): Error: not found",
    );
  });

  it("throws on unexpected output format", async () => {
    mockExecAsync.mockResolvedValue({
      stdout: "Something unexpected happened",
      stderr: "",
      exitCode: 0,
    });

    await expect(dryRunBqQuery("SELECT 1")).rejects.toThrow(
      "Could not parse dry run output",
    );
  });
});

describe("isBqAvailable", () => {
  it("returns true when bq version succeeds", async () => {
    mockExecAsync.mockResolvedValue({
      stdout: "Google Cloud SDK 450.0.0",
      stderr: "",
      exitCode: 0,
    });

    const result = await isBqAvailable();
    expect(result).toBe(true);
  });

  it("returns false when bq version fails", async () => {
    mockExecAsync.mockResolvedValue({
      stdout: "",
      stderr: "command not found",
      exitCode: 127,
    });

    const result = await isBqAvailable();
    expect(result).toBe(false);
  });

  it("returns false when execAsync throws", async () => {
    mockExecAsync.mockRejectedValue(new Error("ENOENT"));

    const result = await isBqAvailable();
    expect(result).toBe(false);
  });
});

describe("fetchDirectDependents", () => {
  const dryRunOutput = (bytes: number) => ({
    stdout: `Query successfully validated. Assuming the tables are not modified, running this query will process ${bytes} bytes of data.\n`,
    stderr: "",
    exitCode: 0,
  });

  const snapshotRows = JSON.stringify([
    { latest: "2026-02-14 00:00:00 UTC" },
  ]);

  const batchRows = JSON.stringify([
    { package: "express", dep: "qs" },
    { package: "webpack", dep: "mkdirp" },
  ]);

  function setupMocks() {
    // Mock fetch for fetchPopularPackages (2 pages of npm search)
    const mockFetch = vi.fn();
    const makeNpmPage = (names: string[]) => ({
      ok: true,
      json: async () => ({
        objects: names.map((name) => ({ package: { name } })),
      }),
    });
    mockFetch
      .mockResolvedValueOnce(makeNpmPage(["express", "webpack"]))
      .mockResolvedValueOnce(makeNpmPage([]));
    vi.stubGlobal("fetch", mockFetch);

    // execAsync calls in order:
    // 1. findLatestSnapshot (executeBqQuery)
    // 2. dryRunBqQuery for snapshot SQL
    // 3. dryRunBqQuery for batch SQL
    // 4. queryDependents batch 1 (executeBqQuery) — only if confirmed
    mockExecAsync
      .mockResolvedValueOnce({ stdout: snapshotRows, stderr: "", exitCode: 0 }) // findLatestSnapshot
      .mockResolvedValueOnce(dryRunOutput(1000)) // dry run: snapshot
      .mockResolvedValueOnce(dryRunOutput(18_000_000_000)) // dry run: batch
      .mockResolvedValueOnce({ stdout: batchRows, stderr: "", exitCode: 0 }); // real batch query
  }

  it("runs dry run and proceeds when confirmed", async () => {
    setupMocks();
    const confirm = vi.fn().mockResolvedValue(true);

    const result = await fetchDirectDependents(["qs", "mkdirp"], confirm);

    // Confirm was called with cost summary
    expect(confirm).toHaveBeenCalledOnce();
    const message = confirm.mock.calls[0][0] as string;
    expect(message).toContain("BigQuery cost estimate");
    expect(message).toContain("[y/N]");

    // Real queries were executed — results returned
    expect(result.get("qs")).toEqual(["express"]);
    expect(result.get("mkdirp")).toEqual(["webpack"]);
  });

  it("returns empty map when confirmation declined", async () => {
    setupMocks();
    const confirm = vi.fn().mockResolvedValue(false);

    const result = await fetchDirectDependents(["qs", "mkdirp"], confirm);

    expect(confirm).toHaveBeenCalledOnce();
    expect(result.size).toBe(0);

    // Only 3 execAsync calls: findLatestSnapshot + 2 dry runs (no real batch query)
    expect(mockExecAsync).toHaveBeenCalledTimes(3);
  });

  it("calls dry run before any real batch queries", async () => {
    setupMocks();
    const confirm = vi.fn().mockResolvedValue(true);

    await fetchDirectDependents(["qs", "mkdirp"], confirm);

    // Call 1: findLatestSnapshot (real query)
    // Call 2: dry run for snapshot SQL (has --dry_run)
    // Call 3: dry run for batch SQL (has --dry_run)
    // Call 4: real batch query
    const calls = mockExecAsync.mock.calls;
    expect(calls[1][1]).toContain("--dry_run");
    expect(calls[2][1]).toContain("--dry_run");
    // Call 4 should NOT have --dry_run
    expect(calls[3][1]).not.toContain("--dry_run");
  });

  it("uses cached data and skips BigQuery entirely", async () => {
    mockCacheGetAll.mockReturnValue({ qs: ["express"] });

    const confirm = vi.fn();
    const result = await fetchDirectDependents(["qs"], confirm);

    expect(result.get("qs")).toEqual(["express"]);
    expect(confirm).not.toHaveBeenCalled();
    expect(mockExecAsync).not.toHaveBeenCalled();
  });
});
