/**
 * BigQuery integration for fetching direct dependency data from deps.dev.
 *
 * Uses the `bq` CLI tool to query `bigquery-public-data.deps_dev_v1.Dependencies`
 * for accurate direct dependency relationships, replacing the broken libraries.io
 * /dependents endpoint.
 *
 * Safety: every query uses --maximum_bytes_billed and a dry run before execution.
 */

import { resolve } from "node:path";
import { BigQueryCache } from "./bigquery-cache.ts";
import { execAsync } from "./utils/exec.ts";

// Max bytes per query (25 GB safety cap)
const MAX_BYTES_PER_QUERY = 25_000_000_000;

// Popular package search: 2 pages of 250
const NPM_SEARCH_SIZE = 250;
const NPM_SEARCH_PAGES = 2;

// Batch size for BigQuery queries (popular packages per query)
const BQ_BATCH_SIZE = 100;

interface BqRow {
  package: string;
  dep: string;
}

/**
 * Run a BigQuery dry run to estimate bytes processed.
 * Returns the estimated byte count. Throws on error.
 */
export async function dryRunBqQuery(sql: string): Promise<number> {
  const { stdout, stderr, exitCode } = await execAsync("bq", [
    "query",
    "--dry_run",
    "--use_legacy_sql=false",
    "--",
    sql,
  ]);

  if (exitCode !== 0) {
    throw new Error(`bq dry run failed (exit ${exitCode}): ${stderr.trim()}`);
  }

  const match = stdout.match(/(\d+) bytes of data/);
  if (!match) {
    throw new Error(`Could not parse dry run output: ${stdout.trim()}`);
  }

  return Number(match[1]);
}

/**
 * Execute a BigQuery query via the `bq` CLI.
 * Returns parsed JSON rows. Throws on error or if bytes exceed cap.
 */
export async function executeBqQuery(
  sql: string,
  maxBytes: number = MAX_BYTES_PER_QUERY,
): Promise<object[]> {
  const { stdout, stderr, exitCode } = await execAsync("bq", [
    "query",
    "--format=json",
    "--use_legacy_sql=false",
    `--maximum_bytes_billed=${maxBytes}`,
    "--",
    sql,
  ]);

  if (exitCode !== 0) {
    throw new Error(`bq query failed (exit ${exitCode}): ${stderr.trim()}`);
  }

  const trimmed = stdout.trim();
  if (!trimmed || trimmed === "[]") return [];
  return JSON.parse(trimmed) as object[];
}

/**
 * Check if the `bq` CLI is available.
 */
export async function isBqAvailable(): Promise<boolean> {
  try {
    const { exitCode } = await execAsync("bq", ["version"]);
    return exitCode === 0;
  } catch {
    return false;
  }
}

/**
 * Find the latest snapshot date from the deps_dev_v1.Snapshots table.
 * This is a tiny query (~KB scan).
 */
export async function findLatestSnapshot(): Promise<string> {
  const sql = `
    SELECT MAX(Time) as latest
    FROM \`bigquery-public-data.deps_dev_v1.Snapshots\`
  `;
  const rows = (await executeBqQuery(sql, 1_000_000_000)) as Array<{
    latest: string;
  }>;
  if (!rows.length || !rows[0].latest) {
    throw new Error("Could not find latest snapshot date");
  }
  return rows[0].latest;
}

/**
 * Fetch top popular npm packages via the npm registry search API.
 * Sorted by popularity, 2 pages of 250 = up to 500 packages.
 */
export async function fetchPopularPackages(): Promise<string[]> {
  const packages: string[] = [];

  for (let page = 0; page < NPM_SEARCH_PAGES; page++) {
    const offset = page * NPM_SEARCH_SIZE;
    const url =
      `https://registry.npmjs.org/-/v1/search` +
      `?text=${encodeURIComponent("popularity:>0.5")}` +
      `&popularity=1.0&quality=0.0&maintenance=0.0` +
      `&size=${NPM_SEARCH_SIZE}&from=${offset}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(
          `  npm search page ${page} failed: ${response.status}`,
        );
        continue;
      }
      const data = (await response.json()) as {
        objects: Array<{ package: { name: string } }>;
      };
      for (const obj of data.objects) {
        packages.push(obj.package.name);
      }
    } catch (err) {
      console.warn(`  npm search page ${page} error: ${err}`);
    }
  }

  return packages;
}

/**
 * Build a SQL-safe string list for IN clauses.
 * Escapes single quotes in package names.
 */
function sqlList(names: string[]): string {
  return names.map((n) => `'${n.replace(/'/g, "\\'")}'`).join(", ");
}

/**
 * Build SQL for querying direct dependents of replaceable packages among popular packages.
 */
export function buildDependentsSQL(
  popularBatch: string[],
  replaceableNames: string[],
  snapshotDate: string,
): string {
  const startDate = new Date(snapshotDate);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);

  const startStr = startDate.toISOString().replace("T", " ").replace("Z", " UTC");
  const endStr = endDate.toISOString().replace("T", " ").replace("Z", " UTC");

  return `
    SELECT DISTINCT Name as package, Dependency.Name as dep
    FROM \`bigquery-public-data.deps_dev_v1.Dependencies\`
    WHERE SnapshotAt BETWEEN TIMESTAMP("${startStr}") AND TIMESTAMP("${endStr}")
      AND System = "NPM"
      AND Name IN (${sqlList(popularBatch)})
      AND MinimumDepth = 1
      AND Dependency.Name IN (${sqlList(replaceableNames)})
  `;
}

/**
 * Query BigQuery for direct dependents of replaceable packages among popular packages.
 *
 * Strategy: batch popular packages into groups of ~100, query each batch against
 * all replaceable package names. Each batch scans ~18 GB (upper bound).
 */
async function queryDependents(
  popularBatch: string[],
  replaceableNames: string[],
  snapshotDate: string,
): Promise<BqRow[]> {
  const sql = buildDependentsSQL(popularBatch, replaceableNames, snapshotDate);
  return (await executeBqQuery(sql)) as BqRow[];
}

const BYTES_PER_TIB = 1024 ** 4;
const COST_PER_TIB = 6.25;

function formatGB(bytes: number): string {
  return (bytes / 1e9).toFixed(2);
}

function formatCost(bytes: number): string {
  return `$${((bytes / BYTES_PER_TIB) * COST_PER_TIB).toFixed(2)}`;
}

async function defaultConfirm(message: string): Promise<boolean> {
  process.stdout.write(message);
  if (!process.stdin.isTTY) {
    process.stdout.write("(non-interactive — pass --yes to approve)\n");
    return false;
  }
  for await (const line of console) {
    return line.trim().toLowerCase() === "y";
  }
  return false;
}

/**
 * Main entry point: fetch direct dependents from BigQuery.
 *
 * Returns a Map of replaceableName -> dependent package names.
 * Uses cache to avoid redundant BigQuery queries (7-day TTL).
 *
 * Performs a dry run to estimate cost and prompts for confirmation
 * before executing any real queries. Pass a custom `confirm` function
 * for testing.
 */
const projectRoot = resolve(import.meta.dirname!, "../..");
const cachePath = resolve(projectRoot, ".cache/e18e/bigquery-dependents.json");

export async function fetchDirectDependents(
  replaceableNames: string[],
  confirm: (message: string) => Promise<boolean> = defaultConfirm,
): Promise<Map<string, string[]>> {

  // Check cache first
  const cache = new BigQueryCache(cachePath);
  const cached = cache.getAll();
  if (cached) {
    console.log(
      `  Using cached BigQuery data (${Object.keys(cached).length} entries, ` +
        `fetched ${cache.getFetchedAt()})`,
    );
    return new Map(Object.entries(cached));
  }

  // Find latest snapshot
  console.log("  Finding latest deps.dev snapshot...");
  const snapshotDate = await findLatestSnapshot();
  console.log(`  Latest snapshot: ${snapshotDate}`);

  // Fetch popular packages from npm
  console.log("  Fetching popular npm packages...");
  const popular = await fetchPopularPackages();
  console.log(`  Found ${popular.length} popular packages`);

  // Batch popular packages and query BigQuery
  const batches: string[][] = [];
  for (let i = 0; i < popular.length; i += BQ_BATCH_SIZE) {
    batches.push(popular.slice(i, i + BQ_BATCH_SIZE));
  }

  if (batches.length === 0) {
    console.log("  No popular packages to query — skipping BigQuery");
    return new Map();
  }

  // Dry run: estimate total cost before executing any real queries
  console.log("  Running dry run to estimate cost...");
  const snapshotSql = `
    SELECT MAX(Time) as latest
    FROM \`bigquery-public-data.deps_dev_v1.Snapshots\`
  `;
  const snapshotBytes = await dryRunBqQuery(snapshotSql);
  const batchSql = buildDependentsSQL(batches[0], replaceableNames, snapshotDate);
  const perBatchBytes = await dryRunBqQuery(batchSql);
  const totalBytes = snapshotBytes + perBatchBytes * batches.length;

  const approved = await confirm(
    `\nBigQuery cost estimate:\n` +
    `  Snapshot query:      ${formatGB(snapshotBytes)} GB\n` +
    `  Batch queries:       ${batches.length} x ${formatGB(perBatchBytes)} GB = ${formatGB(perBatchBytes * batches.length)} GB\n` +
    `  Total:               ${formatGB(totalBytes)} GB\n` +
    `  Estimated cost:      ${formatCost(totalBytes)} (at $6.25/TiB)\n` +
    `\nProceed with BigQuery queries? [y/N] `,
  );

  if (!approved) {
    console.log("  BigQuery queries declined — continuing without BigQuery data");
    return new Map();
  }

  console.log(
    `  Querying BigQuery (${batches.length} batches of ~${BQ_BATCH_SIZE} packages)...`,
  );

  const results = new Map<string, Set<string>>();
  for (const name of replaceableNames) {
    results.set(name, new Set());
  }

  let batchNum = 0;
  for (const batch of batches) {
    batchNum++;
    console.log(`  Batch ${batchNum}/${batches.length}...`);
    try {
      const rows = await queryDependents(batch, replaceableNames, snapshotDate);
      for (const row of rows) {
        const depSet = results.get(row.dep);
        if (depSet) {
          depSet.add(row.package);
        }
      }
    } catch (err) {
      console.warn(`  Batch ${batchNum} failed: ${err}`);
    }
  }

  // Convert Sets to arrays
  const output = new Map<string, string[]>();
  for (const [name, deps] of results) {
    if (deps.size > 0) {
      output.set(name, [...deps]);
    }
  }

  // Save to cache
  const cacheData: Record<string, string[]> = {};
  for (const [name, deps] of output) {
    cacheData[name] = deps;
  }
  cache.save(snapshotDate, cacheData);

  const totalMatches = [...output.values()].reduce(
    (sum, deps) => sum + deps.length,
    0,
  );
  console.log(
    `  Found ${totalMatches} dependency relationships across ${output.size} packages`,
  );

  return output;
}
