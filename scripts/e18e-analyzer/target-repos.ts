import type {
  ScoredPackage,
  ScoredTargetRepo,
  TargetRepo,
  ReplacementOpportunity,
} from "./types.ts";
import type { GraphData } from "./expand-graph.ts";
import { createRateLimiter, parallelMap } from "./utils/rate-limiter.ts";

// npm rate limits aggressively — stay conservative
const npmFetch = createRateLimiter(100);

const EMPTY_GITHUB_DATA = {
  daysSinceLastCommit: null,
  daysSinceLastRelease: null,
  isArchived: false,
  openPrCount: 0,
  contributorCountRecent: 0,
  hasContributingMd: false,
  externalPrsMerged: 0,
  externalPrsClosed: 0,
} as const;

// ── Math utilities ──────────────────────────────────────────────────

function sigmoid(x: number, midpoint: number, width: number): number {
  return 1 / (1 + Math.exp((x - midpoint) / width));
}

function minMaxNormalize(
  values: number[],
): { normalize: (v: number) => number } {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return { normalize: (v: number) => (v - min) / range };
}

// ── Helpers ─────────────────────────────────────────────────────────

/** Extract "owner/repo" from a GitHub URL, or return null. */
function parseRepoFullName(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/github\.com\/([^/]+\/[^/]+)/);
  if (!match) return null;
  return match[1].replace(/\.git$/, "");
}

/** Normalize a git URL to a clean https://github.com/... URL. */
function normalizeGitUrl(url: string): string | null {
  let normalized = url
    .replace(/^git\+/, "")
    .replace(/^git:\/\//, "https://")
    .replace(/\.git$/, "")
    .replace(/^ssh:\/\/git@github\.com/, "https://github.com");

  if (normalized.startsWith("github:")) {
    normalized = `https://github.com/${normalized.slice(7)}`;
  }

  if (normalized.includes("github.com")) return normalized;
  return null;
}

/**
 * Resolve repo URLs for a list of npm package names by querying the npm registry.
 * Returns a Map of packageName -> GitHub repo URL.
 */
export async function resolveRepoUrls(
  packageNames: string[],
): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>();

  await parallelMap(packageNames, 10, async (name) => {
    try {
      const url = `https://registry.npmjs.org/${encodeURIComponent(name)}`;
      const response = await npmFetch(url, {
        headers: { Accept: "application/vnd.npm.install-v1+json" },
      });
      if (!response.ok) {
        results.set(name, null);
        return;
      }
      const data = (await response.json()) as Record<string, unknown>;
      const repo = data.repository as
        | { url?: string }
        | string
        | undefined;
      if (typeof repo === "string") {
        results.set(name, normalizeGitUrl(repo));
      } else if (repo?.url) {
        results.set(name, normalizeGitUrl(repo.url));
      } else {
        results.set(name, null);
      }
    } catch {
      results.set(name, null);
    }
  });

  return results;
}

// ── Step 1: Invert ──────────────────────────────────────────────────

export function invertToTargetRepos(
  scored: ScoredPackage[],
  graph: Map<string, GraphData>,
): Map<string, TargetRepo> {
  const repos = new Map<string, TargetRepo>();

  for (const pkg of scored) {
    const graphData = graph.get(pkg.moduleName);
    if (!graphData) continue;

    const opportunity: ReplacementOpportunity = {
      moduleName: pkg.moduleName,
      replacement: pkg.candidate.replacement,
      replacementType: pkg.candidate.replacementType,
      effortMultiplier: pkg.effortMultiplier,
      weeklyDownloads: pkg.weeklyDownloads,
    };

    // Use topDependentPackages (direct npm deps) when available,
    // fall back to topDependentRepos (transitive, repo-level) for
    // packages that were cached before the dependents endpoint was added.
    const depPackages = graphData.topDependentPackages ?? [];

    if (depPackages.length > 0) {
      for (const dep of depPackages) {
        const repoFullName = parseRepoFullName(dep.repoUrl);
        if (!repoFullName) continue;

        const existing = repos.get(repoFullName);
        if (existing) {
          existing.opportunities.push(opportunity);
          existing.stars = Math.max(existing.stars, dep.stars);
        } else {
          repos.set(repoFullName, {
            repoFullName,
            repoUrl: `https://github.com/${repoFullName}`,
            stars: dep.stars,
            pushedAt: null,
            opportunities: [opportunity],
            ...EMPTY_GITHUB_DATA,
          });
        }
      }
    } else {
      // Fallback for old cached data without topDependentPackages
      for (const dep of graphData.topDependentRepos) {
        const existing = repos.get(dep.name);
        if (existing) {
          existing.opportunities.push(opportunity);
          existing.stars = Math.max(existing.stars, dep.stars);
        } else {
          repos.set(dep.name, {
            repoFullName: dep.name,
            repoUrl: `https://github.com/${dep.name}`,
            stars: dep.stars,
            pushedAt: dep.pushedAt ?? null,
            opportunities: [opportunity],
            ...EMPTY_GITHUB_DATA,
          });
        }
      }
    }
  }

  return repos;
}

// ── Step 2: Filter ──────────────────────────────────────────────────

export function filterTargetRepos(
  repos: Map<string, TargetRepo>,
): TargetRepo[] {
  return [...repos.values()].filter((repo) => {
    // Must have at least 2 replaceable deps (bundled PR opportunity)
    if (repo.opportunities.length < 2) return false;

    // Type-only repo, not a real dependent
    if (repo.repoFullName === "DefinitelyTyped/DefinitelyTyped") return false;

    return true;
  });
}

// ── Step 3: Enrich ──────────────────────────────────────────────────

async function enrichTargetRepos(repos: TargetRepo[]): Promise<TargetRepo[]> {
  // Dynamic import to avoid pulling in process.env at module scope
  const { fetchGitHubData } = await import("./enrich.ts");
  let completed = 0;
  await parallelMap(repos, 10, async (repo) => {
    const ghData = await fetchGitHubData(repo.repoUrl);
    Object.assign(repo, ghData);
    completed++;
    if (completed % 25 === 0) {
      console.log(`  ${completed}/${repos.length} repos enriched...`);
    }
  });
  return repos;
}

// ── Step 4: Score ───────────────────────────────────────────────────

function computeReceptiveness(repo: TargetRepo): number {
  if (repo.isArchived) return 0.0;

  const activityDays = repo.daysSinceLastCommit;
  const activity =
    activityDays !== null ? sigmoid(activityDays, 180, 60) : 0.3;

  const releaseDays = repo.daysSinceLastRelease;
  const release = releaseDays !== null ? sigmoid(releaseDays, 365, 120) : 0.3;

  let mergeRatio: number;
  if (repo.externalPrsClosed >= 5) {
    mergeRatio = repo.externalPrsMerged / repo.externalPrsClosed;
  } else {
    mergeRatio = 0.4;
  }

  const contributorCount = Math.max(repo.contributorCountRecent, 1);
  const contributor = Math.min(
    1.0,
    Math.log2(contributorCount) / Math.log2(20),
  );

  const contributingMultiplier = repo.hasContributingMd ? 1.1 : 1.0;

  const raw =
    (0.3 * activity +
      0.15 * release +
      0.35 * mergeRatio +
      0.2 * contributor) *
    contributingMultiplier;

  return Math.max(0.01, Math.min(0.99, raw));
}

export function scoreTargetRepos(repos: TargetRepo[]): ScoredTargetRepo[] {
  if (repos.length === 0) return [];

  const starValues = repos.map((r) => Math.log10(r.stars + 1));
  const dlValues = repos.map((r) => {
    const total = r.opportunities.reduce(
      (sum, o) => sum + o.weeklyDownloads,
      0,
    );
    return Math.log10(total + 1);
  });

  const starNorm = minMaxNormalize(starValues);
  const dlNorm = minMaxNormalize(dlValues);

  const maxOps = Math.max(...repos.map((r) => r.opportunities.length));
  const logMaxOps = Math.log2(maxOps) || 1;

  const now = new Date().toISOString();

  const scored: ScoredTargetRepo[] = repos.map((repo, i) => {
    const reachScore =
      0.6 * starNorm.normalize(starValues[i]) +
      0.4 * dlNorm.normalize(dlValues[i]);

    const receptivenessScore = computeReceptiveness(repo);

    const bundleOpportunity = Math.min(
      1.0,
      Math.log2(repo.opportunities.length) / logMaxOps,
    );

    const totalDl = repo.opportunities.reduce(
      (s, o) => s + o.weeklyDownloads,
      0,
    );
    const aggregateEffort =
      totalDl > 0
        ? repo.opportunities.reduce(
            (s, o) => s + o.effortMultiplier * o.weeklyDownloads,
            0,
          ) / totalDl
        : 0.5;

    const compositeScore =
      reachScore * receptivenessScore * bundleOpportunity * aggregateEffort;

    return {
      ...repo,
      reachScore,
      receptivenessScore,
      bundleOpportunity,
      aggregateEffort,
      compositeScore,
      rank: 0,
      computedAt: now,
    };
  });

  scored.sort((a, b) => b.compositeScore - a.compositeScore);
  for (let i = 0; i < scored.length; i++) {
    scored[i].rank = i + 1;
  }

  return scored;
}

// ── Main ────────────────────────────────────────────────────────────

export async function computeTargetRepos(
  scored: ScoredPackage[],
  graph: Map<string, GraphData>,
  bigQueryDeps?: Map<string, string[]>,
): Promise<ScoredTargetRepo[]> {
  // Merge BigQuery data into graph before inversion
  if (bigQueryDeps && bigQueryDeps.size > 0) {
    // Collect all unique dependent package names for repo URL resolution
    const allDependents = new Set<string>();
    for (const deps of bigQueryDeps.values()) {
      for (const dep of deps) allDependents.add(dep);
    }

    console.log(
      `  Resolving repo URLs for ${allDependents.size} BigQuery dependents...`,
    );
    const repoUrls = await resolveRepoUrls([...allDependents]);

    for (const [replaceableName, dependents] of bigQueryDeps) {
      const graphData = graph.get(replaceableName);
      if (graphData) {
        graphData.topDependentPackages = dependents.map((name) => ({
          name,
          stars: 0, // populated later by GitHub enrichment
          repoUrl: repoUrls.get(name) ?? null,
        }));
      }
    }
  }

  console.log("  Inverting package data to target repos...");
  const inverted = invertToTargetRepos(scored, graph);
  console.log(`  Found ${inverted.size} unique repos across all packages`);

  console.log("  Filtering low-value and inactive repos...");
  const filtered = filterTargetRepos(inverted);
  console.log(`  ${filtered.length} repos after filtering`);

  console.log(
    `  Enriching ${filtered.length} target repos with GitHub data...`,
  );
  const enriched = await enrichTargetRepos(filtered);

  console.log("  Scoring target repos...");
  return scoreTargetRepos(enriched);
}
