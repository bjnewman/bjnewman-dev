#!/usr/bin/env bun
/**
 * e18e Ecosystem Analyzer
 *
 * Pre-computes a ranked leaderboard of npm packages where a modernization PR
 * would have the most impact. Aggregates candidates from multiple sources,
 * enriches with download/dependent/health data, and scores by a multiplicative
 * composite formula.
 *
 * Usage:
 *   bun run scripts/e18e-analyzer/index.ts              # full run (~20 min)
 *   bun run scripts/e18e-analyzer/index.ts --limit 20   # dev mode (~30 sec)
 *
 * Environment:
 *   LIBRARIES_IO_API_KEY  — for reverse dependency lookups (optional but recommended)
 *   GITHUB_TOKEN          — for repo health signals (optional but recommended)
 */

import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { gatherCandidates } from "./sources/index.ts";
import { expandGraph } from "./expand-graph.ts";
import { enrich } from "./enrich.ts";
import { scorePackages } from "./score.ts";
import { generateOutputs } from "./output.ts";
import { LibrariesIoCache } from "./cache.ts";

const PROJECT_ROOT = resolve(import.meta.dirname!, "../..");
const CACHE_PATH = resolve(PROJECT_ROOT, ".cache/e18e/libraries-io.json");

const { values: args } = parseArgs({
  options: {
    limit: { type: "string", short: "l" },
  },
  strict: false,
});

const LIMIT = args.limit ? parseInt(args.limit, 10) : 0;

function estimateTime(count: number): string {
  // ~1 sec per libraries.io call + ~0.5 sec per npm metadata call + GitHub
  const seconds = count * 1.1 + count * 0.5 + Math.min(count, 500) * 0.8;
  const minutes = Math.ceil(seconds / 60);
  if (minutes <= 1) return "~30 sec";
  return `~${minutes} min`;
}

async function main() {
  const start = Date.now();

  // Load libraries.io cache
  const cache = new LibrariesIoCache(CACHE_PATH);
  if (cache.validCount > 0) {
    console.log(`Loaded libraries.io cache: ${cache.validCount} valid entries\n`);
  }

  console.log("Step 1/5: Gathering candidates from all sources...");
  let candidates = await gatherCandidates();

  if (LIMIT > 0) {
    // Sample across sources for representative results
    const bySource = new Map<string, typeof candidates>();
    for (const c of candidates) {
      const list = bySource.get(c.source) ?? [];
      list.push(c);
      bySource.set(c.source, list);
    }
    const sampled: typeof candidates = [];
    const perSource = Math.max(1, Math.floor(LIMIT / bySource.size));
    for (const [, list] of bySource) {
      sampled.push(...list.slice(0, perSource));
    }
    // Fill remaining slots from largest source
    const largest = [...bySource.values()].sort((a, b) => b.length - a.length)[0];
    while (sampled.length < LIMIT && largest.length > perSource) {
      const next = largest[sampled.length];
      if (next && !sampled.includes(next)) sampled.push(next);
      else break;
    }
    candidates = sampled.slice(0, LIMIT);
    console.log(`  --limit ${LIMIT}: sampled ${candidates.length} across ${bySource.size} sources`);
  }

  console.log(`  Processing ${candidates.length} candidates (est. ${estimateTime(candidates.length)})\n`);

  console.log("Step 2/5: Expanding dependency graph...");
  const graph = await expandGraph(candidates, cache);
  const withDeps = [...graph.values()].filter(
    (g) => g.dependentCount > 0,
  ).length;
  console.log(
    `  ${withDeps}/${candidates.length} packages have known dependents\n`,
  );

  console.log("Step 3/5: Enriching with metrics...");
  const enriched = await enrich(candidates, graph);
  console.log(`  Enriched ${enriched.length} packages\n`);

  // Update cache with npm publish dates for smart invalidation
  const publishDates = new Map<string, string | null>();
  for (const pkg of enriched) {
    publishDates.set(pkg.moduleName, pkg.lastPublishDate);
  }
  cache.updatePublishDates(publishDates);
  cache.save();
  console.log(`  Saved libraries.io cache (${cache.size} entries)\n`);

  console.log("Step 4/5: Computing scores and rankings...");
  const scored = scorePackages(enriched);
  console.log(`  Scored ${scored.length} packages\n`);

  console.log("Step 5/5: Generating output files...");
  generateOutputs(scored, {
    leaderboard: resolve(PROJECT_ROOT, "public/e18e/api/leaderboard.json"),
    stats: resolve(PROJECT_ROOT, "public/e18e/api/stats.json"),
    sqlite: resolve(PROJECT_ROOT, "public/e18e/data/ecosystem.db"),
  });
  console.log();

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`Done in ${elapsed}s`);
  console.log(`  Total packages: ${scored.length}`);
  console.log(`  Top opportunity: ${scored[0]?.moduleName ?? "N/A"}`);
  console.log(
    `  Top score: ${scored[0]?.compositeScore.toFixed(4) ?? "N/A"}`,
  );
  console.log(`  Top 5:`);
  for (const pkg of scored.slice(0, 5)) {
    console.log(
      `    ${pkg.rank}. ${pkg.moduleName} — score: ${pkg.compositeScore.toFixed(4)}, ` +
        `downloads: ${pkg.weeklyDownloads.toLocaleString()}, ` +
        `dependents: ${pkg.dependentCount}, ` +
        `status: ${pkg.status}`,
    );
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
