import { describe, it, expect } from "vitest";
import {
  invertToTargetRepos,
  filterTargetRepos,
  scoreTargetRepos,
} from "../../../scripts/e18e-analyzer/target-repos.ts";
import type {
  ScoredPackage,
  Candidate,
  TargetRepo,
} from "../../../scripts/e18e-analyzer/types.ts";
import type { GraphData } from "../../../scripts/e18e-analyzer/expand-graph.ts";

function makeCandidate(overrides: Partial<Candidate> = {}): Candidate {
  return {
    moduleName: "test-pkg",
    source: "module-replacements",
    replacementType: "native",
    replacement: "native code",
    ...overrides,
  };
}

function makeScoredPackage(
  overrides: Partial<ScoredPackage> = {},
): ScoredPackage {
  const candidate = makeCandidate(overrides.candidate);
  return {
    moduleName: candidate.moduleName,
    candidate,
    weeklyDownloads: 100_000,
    lastPublishDate: "2024-01-01",
    repoUrl: "https://github.com/test/test",
    isDeprecated: false,
    dependentCount: 500,
    topDependents: [],
    daysSinceLastCommit: 30,
    daysSinceLastRelease: 60,
    isArchived: false,
    openPrCount: 5,
    contributorCountRecent: 3,
    hasContributingMd: false,
    externalPrsMerged: 8,
    externalPrsClosed: 10,
    impactScore: 0.8,
    effortMultiplier: 1.0,
    mergeProbability: 0.7,
    livenessPenalty: 1.0,
    compositeScore: 0.56,
    tier: 1,
    status: "active",
    rank: 1,
    percentile: 100,
    computedAt: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeGraphData(
  packages: Array<{
    name: string;
    stars: number;
    repoUrl?: string | null;
  }>,
  overrides: Partial<GraphData> = {},
): GraphData {
  return {
    dependentCount: 100,
    dependentReposCount: 50,
    topDependentRepos: [],
    topDependentPackages: packages.map((p) => ({
      name: p.name,
      stars: p.stars,
      repoUrl: p.repoUrl ?? `https://github.com/${p.name}`,
    })),
    ...overrides,
  };
}

function makeTargetRepo(overrides: Partial<TargetRepo> = {}): TargetRepo {
  return {
    repoFullName: "org/repo",
    repoUrl: "https://github.com/org/repo",
    stars: 5000,
    pushedAt: "2024-06-01T00:00:00Z",
    opportunities: [
      {
        moduleName: "pkg-a",
        replacement: "native code",
        replacementType: "native",
        effortMultiplier: 1.0,
        weeklyDownloads: 100_000,
      },
      {
        moduleName: "pkg-b",
        replacement: "native code",
        replacementType: "native",
        effortMultiplier: 0.9,
        weeklyDownloads: 50_000,
      },
    ],
    daysSinceLastCommit: 10,
    daysSinceLastRelease: 30,
    isArchived: false,
    openPrCount: 5,
    contributorCountRecent: 3,
    hasContributingMd: true,
    externalPrsMerged: 8,
    externalPrsClosed: 10,
    ...overrides,
  };
}

// ── Inversion tests ─────────────────────────────────────────────────

describe("invertToTargetRepos", () => {
  it("groups multiple packages into a single repo entry", () => {
    const pkg1 = makeScoredPackage({
      moduleName: "pump",
      candidate: makeCandidate({ moduleName: "pump" }),
    });
    const pkg2 = makeScoredPackage({
      moduleName: "end-of-stream",
      candidate: makeCandidate({ moduleName: "end-of-stream" }),
    });

    const graph = new Map<string, GraphData>();
    graph.set(
      "pump",
      makeGraphData([
        {
          name: "readable-stream",
          stars: 1000,
          repoUrl: "https://github.com/nodejs/readable-stream",
        },
      ]),
    );
    graph.set(
      "end-of-stream",
      makeGraphData([
        {
          name: "readable-stream",
          stars: 1200,
          repoUrl: "https://github.com/nodejs/readable-stream",
        },
      ]),
    );

    const result = invertToTargetRepos([pkg1, pkg2], graph);

    expect(result.size).toBe(1);
    const repo = result.get("nodejs/readable-stream")!;
    expect(repo.opportunities).toHaveLength(2);
    expect(repo.opportunities.map((o) => o.moduleName)).toContain("pump");
    expect(repo.opportunities.map((o) => o.moduleName)).toContain(
      "end-of-stream",
    );
  });

  it("keeps max stars across multiple appearances", () => {
    const pkg1 = makeScoredPackage({
      moduleName: "pkg-a",
      candidate: makeCandidate({ moduleName: "pkg-a" }),
    });
    const pkg2 = makeScoredPackage({
      moduleName: "pkg-b",
      candidate: makeCandidate({ moduleName: "pkg-b" }),
    });

    const graph = new Map<string, GraphData>();
    graph.set(
      "pkg-a",
      makeGraphData([
        {
          name: "dep-x",
          stars: 500,
          repoUrl: "https://github.com/big/repo",
        },
      ]),
    );
    graph.set(
      "pkg-b",
      makeGraphData([
        {
          name: "dep-y",
          stars: 2000,
          repoUrl: "https://github.com/big/repo",
        },
      ]),
    );

    const result = invertToTargetRepos([pkg1, pkg2], graph);
    expect(result.get("big/repo")!.stars).toBe(2000);
  });

  it("skips dependent packages without a GitHub repo URL", () => {
    const pkg = makeScoredPackage({
      moduleName: "pump",
      candidate: makeCandidate({ moduleName: "pump" }),
    });

    const graph = new Map<string, GraphData>();
    graph.set(
      "pump",
      makeGraphData([
        { name: "no-repo-pkg", stars: 100, repoUrl: null },
        {
          name: "has-repo-pkg",
          stars: 200,
          repoUrl: "https://github.com/org/repo",
        },
      ]),
    );

    const result = invertToTargetRepos([pkg], graph);
    expect(result.size).toBe(1);
    expect(result.has("org/repo")).toBe(true);
  });

  it("handles packages with no graph data", () => {
    const pkg = makeScoredPackage();
    const graph = new Map<string, GraphData>();

    const result = invertToTargetRepos([pkg], graph);
    expect(result.size).toBe(0);
  });

  it("creates separate entries for different repos", () => {
    const pkg = makeScoredPackage({
      moduleName: "pump",
      candidate: makeCandidate({ moduleName: "pump" }),
    });

    const graph = new Map<string, GraphData>();
    graph.set(
      "pump",
      makeGraphData([
        {
          name: "dep-a",
          stars: 100,
          repoUrl: "https://github.com/repo/a",
        },
        {
          name: "dep-b",
          stars: 200,
          repoUrl: "https://github.com/repo/b",
        },
      ]),
    );

    const result = invertToTargetRepos([pkg], graph);
    expect(result.size).toBe(2);
    expect(result.has("repo/a")).toBe(true);
    expect(result.has("repo/b")).toBe(true);
  });

  it("falls back to topDependentRepos when topDependentPackages is empty", () => {
    const pkg = makeScoredPackage({
      moduleName: "pump",
      candidate: makeCandidate({ moduleName: "pump" }),
    });

    const graph = new Map<string, GraphData>();
    graph.set("pump", {
      dependentCount: 100,
      dependentReposCount: 50,
      topDependentRepos: [
        { name: "legacy/repo", stars: 500, pushedAt: null },
      ],
      topDependentPackages: [],
    });

    const result = invertToTargetRepos([pkg], graph);
    expect(result.size).toBe(1);
    expect(result.has("legacy/repo")).toBe(true);
  });
});

// ── Filter tests ────────────────────────────────────────────────────

describe("filterTargetRepos", () => {
  it("excludes repos with fewer than 2 opportunities", () => {
    const repos = new Map<string, TargetRepo>();
    repos.set(
      "single/dep",
      makeTargetRepo({
        repoFullName: "single/dep",
        opportunities: [
          {
            moduleName: "only-one",
            replacement: "native",
            replacementType: "native",
            effortMultiplier: 1.0,
            weeklyDownloads: 100,
          },
        ],
      }),
    );

    const result = filterTargetRepos(repos);
    expect(result).toHaveLength(0);
  });

  it("excludes DefinitelyTyped", () => {
    const repos = new Map<string, TargetRepo>();
    repos.set(
      "DefinitelyTyped/DefinitelyTyped",
      makeTargetRepo({
        repoFullName: "DefinitelyTyped/DefinitelyTyped",
      }),
    );

    const result = filterTargetRepos(repos);
    expect(result).toHaveLength(0);
  });

  it("includes repos with 2+ opportunities", () => {
    const repos = new Map<string, TargetRepo>();
    repos.set("active/repo", makeTargetRepo({ repoFullName: "active/repo" }));

    const result = filterTargetRepos(repos);
    expect(result).toHaveLength(1);
    expect(result[0].repoFullName).toBe("active/repo");
  });
});

// ── Scoring tests ───────────────────────────────────────────────────

describe("scoreTargetRepos", () => {
  it("returns empty array for empty input", () => {
    expect(scoreTargetRepos([])).toEqual([]);
  });

  it("assigns rank 1 to a single repo", () => {
    const repos = [makeTargetRepo()];
    const scored = scoreTargetRepos(repos);
    expect(scored).toHaveLength(1);
    expect(scored[0].rank).toBe(1);
  });

  it("ranks higher-star active repo above lower-star stale repo", () => {
    const active = makeTargetRepo({
      repoFullName: "big/active",
      stars: 50000,
      daysSinceLastCommit: 5,
      daysSinceLastRelease: 10,
      externalPrsMerged: 40,
      externalPrsClosed: 50,
      contributorCountRecent: 10,
      opportunities: [
        {
          moduleName: "a",
          replacement: "native",
          replacementType: "native",
          effortMultiplier: 1.0,
          weeklyDownloads: 500_000,
        },
        {
          moduleName: "b",
          replacement: "native",
          replacementType: "native",
          effortMultiplier: 0.9,
          weeklyDownloads: 200_000,
        },
        {
          moduleName: "c",
          replacement: "native",
          replacementType: "native",
          effortMultiplier: 0.95,
          weeklyDownloads: 100_000,
        },
      ],
    });

    const stale = makeTargetRepo({
      repoFullName: "small/stale",
      stars: 100,
      daysSinceLastCommit: 400,
      daysSinceLastRelease: 500,
      externalPrsMerged: 1,
      externalPrsClosed: 10,
      contributorCountRecent: 0,
      opportunities: [
        {
          moduleName: "x",
          replacement: "native",
          replacementType: "native",
          effortMultiplier: 0.3,
          weeklyDownloads: 1000,
        },
        {
          moduleName: "y",
          replacement: "native",
          replacementType: "native",
          effortMultiplier: 0.2,
          weeklyDownloads: 500,
        },
      ],
    });

    const scored = scoreTargetRepos([stale, active]);
    expect(scored[0].repoFullName).toBe("big/active");
    expect(scored[1].repoFullName).toBe("small/stale");
    expect(scored[0].compositeScore).toBeGreaterThan(
      scored[1].compositeScore,
    );
  });

  it("gives archived repo composite score of 0", () => {
    const archived = makeTargetRepo({
      repoFullName: "dead/repo",
      isArchived: true,
    });

    const scored = scoreTargetRepos([archived]);
    expect(scored[0].compositeScore).toBe(0);
    expect(scored[0].receptivenessScore).toBe(0);
  });

  it("computes aggregate effort as download-weighted mean", () => {
    const repo = makeTargetRepo({
      opportunities: [
        {
          moduleName: "easy",
          replacement: "native",
          replacementType: "native",
          effortMultiplier: 1.0,
          weeklyDownloads: 900_000,
        },
        {
          moduleName: "hard",
          replacement: "some lib",
          replacementType: "documented",
          effortMultiplier: 0.2,
          weeklyDownloads: 100_000,
        },
      ],
    });

    const scored = scoreTargetRepos([repo]);
    // Weighted mean: (1.0 * 900k + 0.2 * 100k) / (900k + 100k) = 920k / 1M = 0.92
    expect(scored[0].aggregateEffort).toBeCloseTo(0.92, 2);
  });

  it("gives higher bundle opportunity to repo with more deps", () => {
    const many = makeTargetRepo({
      repoFullName: "many/deps",
      opportunities: Array.from({ length: 8 }, (_, i) => ({
        moduleName: `pkg-${i}`,
        replacement: "native",
        replacementType: "native" as const,
        effortMultiplier: 1.0,
        weeklyDownloads: 10_000,
      })),
    });

    const few = makeTargetRepo({
      repoFullName: "few/deps",
      opportunities: [
        {
          moduleName: "a",
          replacement: "native",
          replacementType: "native",
          effortMultiplier: 1.0,
          weeklyDownloads: 10_000,
        },
        {
          moduleName: "b",
          replacement: "native",
          replacementType: "native",
          effortMultiplier: 1.0,
          weeklyDownloads: 10_000,
        },
      ],
    });

    const scored = scoreTargetRepos([few, many]);
    const manyScored = scored.find((s) => s.repoFullName === "many/deps")!;
    const fewScored = scored.find((s) => s.repoFullName === "few/deps")!;
    expect(manyScored.bundleOpportunity).toBeGreaterThan(
      fewScored.bundleOpportunity,
    );
  });
});

// ── BigQuery integration tests ───────────────────────────────────────

describe("BigQuery data injection into invertToTargetRepos", () => {
  it("uses BigQuery-populated topDependentPackages for inversion", () => {
    const pkg = makeScoredPackage({
      moduleName: "rimraf",
      candidate: makeCandidate({ moduleName: "rimraf" }),
    });

    // Simulate BigQuery-injected data (stars=0, repo URL resolved)
    const graph = new Map<string, GraphData>();
    graph.set("rimraf", {
      dependentCount: 500,
      dependentReposCount: 200,
      topDependentRepos: [],
      topDependentPackages: [
        {
          name: "webpack-cli",
          stars: 0,
          repoUrl: "https://github.com/webpack/webpack-cli",
        },
        {
          name: "jest",
          stars: 0,
          repoUrl: "https://github.com/jestjs/jest",
        },
      ],
    });

    const result = invertToTargetRepos([pkg], graph);
    expect(result.size).toBe(2);
    expect(result.has("webpack/webpack-cli")).toBe(true);
    expect(result.has("jestjs/jest")).toBe(true);

    // Stars should be 0 (populated later by GitHub enrichment)
    expect(result.get("webpack/webpack-cli")!.stars).toBe(0);
  });

  it("merges BigQuery deps with existing graph data", () => {
    const pkg1 = makeScoredPackage({
      moduleName: "rimraf",
      candidate: makeCandidate({ moduleName: "rimraf" }),
    });
    const pkg2 = makeScoredPackage({
      moduleName: "mkdirp",
      candidate: makeCandidate({ moduleName: "mkdirp" }),
    });

    const graph = new Map<string, GraphData>();
    // rimraf has BigQuery data
    graph.set("rimraf", {
      dependentCount: 500,
      dependentReposCount: 200,
      topDependentRepos: [],
      topDependentPackages: [
        {
          name: "jest",
          stars: 0,
          repoUrl: "https://github.com/jestjs/jest",
        },
      ],
    });
    // mkdirp has no BigQuery data — falls back to topDependentRepos
    graph.set("mkdirp", {
      dependentCount: 300,
      dependentReposCount: 100,
      topDependentRepos: [
        { name: "legacy/fallback", stars: 200, pushedAt: null },
      ],
      topDependentPackages: [],
    });

    const result = invertToTargetRepos([pkg1, pkg2], graph);
    expect(result.has("jestjs/jest")).toBe(true);
    expect(result.has("legacy/fallback")).toBe(true);
  });
});
