import type {
  PackageData,
  ScoredPackage,
  PackageStatus,
  Tier,
} from "./types.ts";
import { EFFORT_TIERS, DEFAULT_EFFORT } from "./effort-tiers.ts";

// ── Math utilities ──────────────────────────────────────────────────

function sigmoid(x: number, midpoint: number, width: number): number {
  return 1 / (1 + Math.exp((x - midpoint) / width));
}

function minMaxNormalize(
  values: number[],
): { normalize: (v: number) => number; min: number; max: number } {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1; // avoid division by zero
  return {
    normalize: (v: number) => (v - min) / range,
    min,
    max,
  };
}

// ── Impact score ────────────────────────────────────────────────────

function computeImpactScores(
  packages: PackageData[],
): Map<string, number> {
  const dlValues = packages.map((p) => Math.log10(p.weeklyDownloads + 1));
  const depValues = packages.map((p) => Math.log10(p.dependentCount + 1));

  // Cascade: sum of top dependent stars (proxy for reach)
  const cascValues = packages.map((p) => {
    const totalStars = p.topDependents.reduce(
      (sum, d) => sum + d.downloads,
      0,
    );
    return Math.log10(totalStars + 1);
  });

  const dlNorm = minMaxNormalize(dlValues);
  const depNorm = minMaxNormalize(depValues);
  const cascNorm = minMaxNormalize(cascValues);

  const results = new Map<string, number>();
  for (let i = 0; i < packages.length; i++) {
    const impact =
      0.35 * dlNorm.normalize(dlValues[i]) +
      0.45 * depNorm.normalize(depValues[i]) +
      0.20 * cascNorm.normalize(cascValues[i]);
    results.set(packages[i].moduleName, impact);
  }

  return results;
}

// ── Effort multiplier ───────────────────────────────────────────────

export function computeEffort(pkg: PackageData): number {
  switch (pkg.candidate.replacementType) {
    case "native":
      return 1.0;
    case "simple":
      return 0.95;
    case "remove":
      return 1.0;
    case "documented":
      return EFFORT_TIERS[pkg.candidate.docPath ?? ""] ?? DEFAULT_EFFORT;
  }
}

// ── Merge probability ───────────────────────────────────────────────

export function computeMergeProbability(pkg: PackageData): number {
  if (pkg.isArchived) return 0.0;

  // Activity signal: sigmoid centered at 180 days, width 60
  const activity =
    pkg.daysSinceLastCommit !== null
      ? sigmoid(pkg.daysSinceLastCommit, 180, 60)
      : 0.3; // no data = cautious

  // Release freshness: sigmoid centered at 365 days, width 120
  const release =
    pkg.daysSinceLastRelease !== null
      ? sigmoid(pkg.daysSinceLastRelease, 365, 120)
      : 0.3;

  // External PR merge ratio
  let mergeRatio: number;
  if (pkg.externalPrsClosed >= 5) {
    mergeRatio = pkg.externalPrsMerged / pkg.externalPrsClosed;
  } else {
    mergeRatio = 0.4; // uninformative prior
  }

  // Contributor signal (log, diminishing returns)
  const contributorCount = Math.max(pkg.contributorCountRecent, 1);
  const contributor = Math.min(1.0, Math.log2(contributorCount) / Math.log2(20));

  // CONTRIBUTING.md bonus
  const contributingMultiplier = pkg.hasContributingMd ? 1.1 : 1.0;

  const raw =
    (0.30 * activity +
      0.15 * release +
      0.35 * mergeRatio +
      0.20 * contributor) *
    contributingMultiplier;

  return Math.max(0.01, Math.min(0.99, raw));
}

// ── Liveness penalty ────────────────────────────────────────────────

export function computeLiveness(pkg: PackageData): number {
  if (pkg.isArchived) return 0.05;

  const days = pkg.daysSinceLastCommit;
  if (days === null) return 0.5; // no data = uncertain

  if (days > 730) return 0.10;
  if (days > 365) return 0.30;
  return 1.0;
}

// ── Status classification ───────────────────────────────────────────

export function classifyStatus(pkg: PackageData): PackageStatus {
  if (pkg.isArchived) return "archived";

  const days = pkg.daysSinceLastCommit;
  if (days === null) return "stale"; // no data = assume stale
  if (days > 365) return "dormant";
  if (days > 90) return "stale";
  return "active";
}

// ── Tier assignment ─────────────────────────────────────────────────

function assignTier(impactScore: number): Tier {
  if (impactScore >= 0.8) return 1;
  if (impactScore >= 0.5) return 2;
  if (impactScore >= 0.2) return 3;
  return 4;
}

// ── Main scoring function ───────────────────────────────────────────

export function scorePackages(packages: PackageData[]): ScoredPackage[] {
  const impactScores = computeImpactScores(packages);
  const now = new Date().toISOString();

  // Score each package
  const scored: ScoredPackage[] = packages.map((pkg) => {
    const impactScore = impactScores.get(pkg.moduleName) ?? 0;
    const effortMultiplier = computeEffort(pkg);
    const mergeProbability = computeMergeProbability(pkg);
    const livenessPenalty = computeLiveness(pkg);

    const compositeScore =
      impactScore * effortMultiplier * mergeProbability * livenessPenalty;

    return {
      ...pkg,
      impactScore,
      effortMultiplier,
      mergeProbability,
      livenessPenalty,
      compositeScore,
      tier: assignTier(impactScore),
      status: classifyStatus(pkg),
      rank: 0, // assigned after sorting
      percentile: 0,
      computedAt: now,
    };
  });

  // Sort by composite score descending
  scored.sort((a, b) => b.compositeScore - a.compositeScore);

  // Assign ranks and percentiles
  for (let i = 0; i < scored.length; i++) {
    scored[i].rank = i + 1;
    scored[i].percentile = Math.round(
      ((scored.length - i) / scored.length) * 100,
    );
  }

  return scored;
}
