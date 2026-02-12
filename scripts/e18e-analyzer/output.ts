import { Database } from "bun:sqlite";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { ScoredPackage, LeaderboardEntry, Stats } from "./types.ts";

function ensureDir(filePath: string) {
  mkdirSync(dirname(filePath), { recursive: true });
}

// ── JSON output ─────────────────────────────────────────────────────

function toLeaderboardEntry(pkg: ScoredPackage): LeaderboardEntry {
  return {
    rank: pkg.rank,
    moduleName: pkg.moduleName,
    source: pkg.candidate.source,
    replacementType: pkg.candidate.replacementType,
    replacement: pkg.candidate.replacement,
    weeklyDownloads: pkg.weeklyDownloads,
    dependentCount: pkg.dependentCount,
    compositeScore: Math.round(pkg.compositeScore * 10000) / 10000,
    impactScore: Math.round(pkg.impactScore * 1000) / 1000,
    effortMultiplier: pkg.effortMultiplier,
    mergeProbability: Math.round(pkg.mergeProbability * 1000) / 1000,
    livenessPenalty: pkg.livenessPenalty,
    tier: pkg.tier,
    status: pkg.status,
    repoUrl: pkg.repoUrl,
    topDependents: pkg.topDependents.slice(0, 5),
  };
}

function computeStats(packages: ScoredPackage[]): Stats {
  const bySource: Stats["bySource"] = {
    "module-replacements": 0,
    deprecated: 0,
    "node-builtin": 0,
    "polyfill-decay": 0,
  };
  const byTier: Stats["byTier"] = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const byStatus: Stats["byStatus"] = {
    active: 0,
    stale: 0,
    dormant: 0,
    archived: 0,
  };

  let totalDownloads = 0;
  let activeOpportunities = 0;

  for (const pkg of packages) {
    bySource[pkg.candidate.source]++;
    byTier[pkg.tier]++;
    byStatus[pkg.status]++;
    totalDownloads += pkg.weeklyDownloads;
    if (pkg.status === "active" || pkg.status === "stale") {
      activeOpportunities++;
    }
  }

  return {
    lastUpdated: new Date().toISOString(),
    totalPackages: packages.length,
    totalDownloadsRepresented: totalDownloads,
    activeOpportunities,
    bySource,
    byTier,
    byStatus,
  };
}

// ── SQLite output ───────────────────────────────────────────────────

function writeSqlite(packages: ScoredPackage[], filePath: string) {
  ensureDir(filePath);

  // Remove existing DB if present
  try {
    const { unlinkSync } = require("node:fs");
    unlinkSync(filePath);
  } catch {
    // File doesn't exist, that's fine
  }

  const db = new Database(filePath);

  db.run(`
    CREATE TABLE packages (
      module_name TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      replacement_type TEXT NOT NULL,
      replacement TEXT NOT NULL,
      doc_path TEXT,
      min_node_version TEXT,

      weekly_downloads INTEGER NOT NULL DEFAULT 0,
      last_publish_date TEXT,
      repo_url TEXT,
      is_deprecated INTEGER NOT NULL DEFAULT 0,

      dependent_count INTEGER NOT NULL DEFAULT 0,

      days_since_last_commit INTEGER,
      days_since_last_release INTEGER,
      is_archived INTEGER NOT NULL DEFAULT 0,
      open_pr_count INTEGER NOT NULL DEFAULT 0,
      contributor_count_recent INTEGER NOT NULL DEFAULT 0,
      has_contributing_md INTEGER NOT NULL DEFAULT 0,
      external_prs_merged INTEGER NOT NULL DEFAULT 0,
      external_prs_closed INTEGER NOT NULL DEFAULT 0,

      impact_score REAL NOT NULL,
      effort_multiplier REAL NOT NULL,
      merge_probability REAL NOT NULL,
      liveness_penalty REAL NOT NULL,
      composite_score REAL NOT NULL,

      tier INTEGER NOT NULL,
      status TEXT NOT NULL,
      rank INTEGER NOT NULL,
      percentile INTEGER NOT NULL,
      computed_at TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE dependents (
      package_name TEXT NOT NULL,
      dependent_name TEXT NOT NULL,
      dependent_stars INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (package_name, dependent_name),
      FOREIGN KEY (package_name) REFERENCES packages(module_name)
    )
  `);

  // Create indexes
  db.run(
    "CREATE INDEX idx_composite_score ON packages(composite_score DESC)",
  );
  db.run(
    "CREATE INDEX idx_weekly_downloads ON packages(weekly_downloads DESC)",
  );
  db.run("CREATE INDEX idx_status ON packages(status)");
  db.run("CREATE INDEX idx_source ON packages(source)");
  db.run("CREATE INDEX idx_tier ON packages(tier)");

  // Insert packages
  const insertPkg = db.prepare(`
    INSERT INTO packages VALUES (
      $module_name, $source, $replacement_type, $replacement, $doc_path, $min_node_version,
      $weekly_downloads, $last_publish_date, $repo_url, $is_deprecated,
      $dependent_count,
      $days_since_last_commit, $days_since_last_release, $is_archived,
      $open_pr_count, $contributor_count_recent, $has_contributing_md,
      $external_prs_merged, $external_prs_closed,
      $impact_score, $effort_multiplier, $merge_probability, $liveness_penalty, $composite_score,
      $tier, $status, $rank, $percentile, $computed_at
    )
  `);

  const insertDep = db.prepare(`
    INSERT OR IGNORE INTO dependents VALUES ($package_name, $dependent_name, $dependent_stars)
  `);

  const insertAll = db.transaction((pkgs: ScoredPackage[]) => {
    for (const pkg of pkgs) {
      insertPkg.run({
        $module_name: pkg.moduleName,
        $source: pkg.candidate.source,
        $replacement_type: pkg.candidate.replacementType,
        $replacement: pkg.candidate.replacement,
        $doc_path: pkg.candidate.docPath ?? null,
        $min_node_version: pkg.candidate.minNodeVersion ?? null,
        $weekly_downloads: pkg.weeklyDownloads,
        $last_publish_date: pkg.lastPublishDate,
        $repo_url: pkg.repoUrl,
        $is_deprecated: pkg.isDeprecated ? 1 : 0,
        $dependent_count: pkg.dependentCount,
        $days_since_last_commit: pkg.daysSinceLastCommit,
        $days_since_last_release: pkg.daysSinceLastRelease,
        $is_archived: pkg.isArchived ? 1 : 0,
        $open_pr_count: pkg.openPrCount,
        $contributor_count_recent: pkg.contributorCountRecent,
        $has_contributing_md: pkg.hasContributingMd ? 1 : 0,
        $external_prs_merged: pkg.externalPrsMerged,
        $external_prs_closed: pkg.externalPrsClosed,
        $impact_score: pkg.impactScore,
        $effort_multiplier: pkg.effortMultiplier,
        $merge_probability: pkg.mergeProbability,
        $liveness_penalty: pkg.livenessPenalty,
        $composite_score: pkg.compositeScore,
        $tier: pkg.tier,
        $status: pkg.status,
        $rank: pkg.rank,
        $percentile: pkg.percentile,
        $computed_at: pkg.computedAt,
      });

      for (const dep of pkg.topDependents) {
        insertDep.run({
          $package_name: pkg.moduleName,
          $dependent_name: dep.name,
          $dependent_stars: dep.downloads,
        });
      }
    }
  });

  insertAll(packages);
  db.close();
}

// ── Main output function ────────────────────────────────────────────

interface OutputPaths {
  leaderboard: string;
  stats: string;
  sqlite: string;
}

export function generateOutputs(
  scored: ScoredPackage[],
  paths: OutputPaths,
) {
  // Leaderboard JSON (top 200)
  const leaderboard = scored.slice(0, 200).map(toLeaderboardEntry);
  ensureDir(paths.leaderboard);
  writeFileSync(paths.leaderboard, JSON.stringify(leaderboard, null, 2));
  console.log(`  Wrote ${leaderboard.length} entries to ${paths.leaderboard}`);

  // Stats JSON
  const stats = computeStats(scored);
  ensureDir(paths.stats);
  writeFileSync(paths.stats, JSON.stringify(stats, null, 2));
  console.log(`  Wrote stats to ${paths.stats}`);

  // SQLite
  writeSqlite(scored, paths.sqlite);
  console.log(`  Wrote SQLite database to ${paths.sqlite}`);
}
