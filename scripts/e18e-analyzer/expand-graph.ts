import type { Candidate } from "./types.ts";
import type { LibrariesIoCache } from "./cache.ts";
import { createRateLimiter, parallelMap } from "./utils/rate-limiter.ts";

const LIBRARIES_IO_API_KEY = process.env.LIBRARIES_IO_API_KEY;
const BASE_URL = "https://libraries.io/api";

// 60 req/min free tier
const fetchWithRateLimit = createRateLimiter(55);

interface LibrariesIoPackage {
  dependents_count: number;
  dependent_repos_count: number;
  rank: number;
}

interface DependentRepo {
  full_name: string;
  stargazers_count: number;
  rank: number;
  pushed_at: string;
}

export interface GraphData {
  dependentCount: number;
  dependentReposCount: number;
  topDependentRepos: Array<{
    name: string;
    stars: number;
    pushedAt: string | null;
  }>;
  /** npm packages that directly depend on this package (from /dependents). */
  topDependentPackages: Array<{
    name: string;
    stars: number;
    repoUrl: string | null;
  }>;
}

/**
 * Fetch package-level dependent count from libraries.io.
 */
async function fetchPackageInfo(
  packageName: string,
): Promise<LibrariesIoPackage | null> {
  if (!LIBRARIES_IO_API_KEY) return null;

  const url = `${BASE_URL}/NPM/${encodeURIComponent(packageName)}?api_key=${LIBRARIES_IO_API_KEY}`;
  try {
    const response = await fetchWithRateLimit(url);
    if (!response.ok) {
      if (response.status === 404) return null;
      console.warn(
        `  libraries.io error for ${packageName}: ${response.status}`,
      );
      return null;
    }
    return (await response.json()) as LibrariesIoPackage;
  } catch {
    console.warn(`  libraries.io fetch failed for ${packageName}`);
    return null;
  }
}

/**
 * Fetch top dependent repositories for cascade impact estimation.
 * Only fetched for higher-impact packages (called selectively by the orchestrator).
 */
async function fetchTopDependentRepos(
  packageName: string,
  perPage = 30,
): Promise<DependentRepo[]> {
  if (!LIBRARIES_IO_API_KEY) return [];

  const url =
    `${BASE_URL}/NPM/${encodeURIComponent(packageName)}/dependent_repositories` +
    `?api_key=${LIBRARIES_IO_API_KEY}&per_page=${perPage}&sort=rank`;
  try {
    const response = await fetchWithRateLimit(url);
    if (!response.ok) return [];
    return (await response.json()) as DependentRepo[];
  } catch {
    return [];
  }
}

/**
 * Build dependency graph data for all candidates.
 * Uses cache to avoid redundant libraries.io calls — only fetches packages
 * that aren't cached or whose cache has expired.
 *
 * Returns a map of moduleName → graph data.
 */
export async function expandGraph(
  candidates: Candidate[],
  cache?: LibrariesIoCache,
): Promise<Map<string, GraphData>> {
  const graph = new Map<string, GraphData>();

  if (!LIBRARIES_IO_API_KEY) {
    console.warn(
      "  LIBRARIES_IO_API_KEY not set — skipping dependency graph expansion",
    );
    for (const candidate of candidates) {
      graph.set(candidate.moduleName, {
        dependentCount: 0,
        dependentReposCount: 0,
        topDependentRepos: [],
        topDependentPackages: [],
      });
    }
    return graph;
  }

  // Check cache for each candidate, split into cached vs uncached
  const uncached: Candidate[] = [];
  let cacheHits = 0;

  for (const candidate of candidates) {
    const cached = cache?.get(candidate.moduleName);
    if (cached) {
      graph.set(candidate.moduleName, cached);
      cacheHits++;
    } else {
      uncached.push(candidate);
    }
  }

  if (cacheHits > 0) {
    console.log(`  ${cacheHits} packages served from cache, ${uncached.length} to fetch`);
  }

  if (uncached.length === 0) return graph;

  // Phase 1: Get dependent counts for uncached packages
  console.log(`  Fetching dependent counts for ${uncached.length} packages...`);
  let completed = 0;
  await parallelMap(uncached, 5, async (candidate) => {
    const info = await fetchPackageInfo(candidate.moduleName);
    const data: GraphData = {
      dependentCount: info?.dependents_count ?? 0,
      dependentReposCount: info?.dependent_repos_count ?? 0,
      topDependentRepos: [],
      topDependentPackages: [],
    };
    graph.set(candidate.moduleName, data);
    completed++;
    if (completed % 50 === 0) {
      console.log(`  ${completed}/${uncached.length} packages...`);
    }
  });

  // Phase 2: Top dependent repos for high-dependent uncached packages
  const highImpact = uncached.filter((c) => {
    const data = graph.get(c.moduleName);
    return data && data.dependentCount >= 50;
  });

  if (highImpact.length > 0) {
    console.log(
      `  Fetching top dependents for ${highImpact.length} high-impact packages...`,
    );
    let repoCompleted = 0;
    await parallelMap(highImpact, 5, async (candidate) => {
      const repos = await fetchTopDependentRepos(candidate.moduleName);
      const data = graph.get(candidate.moduleName)!;
      const seen = new Set<string>();
      data.topDependentRepos = repos
        .filter((r) => {
          if (seen.has(r.full_name)) return false;
          seen.add(r.full_name);
          return true;
        })
        .map((r) => ({
          name: r.full_name,
          stars: r.stargazers_count,
          pushedAt: r.pushed_at ?? null,
        }));
      repoCompleted++;
      if (repoCompleted % 25 === 0) {
        console.log(`  ${repoCompleted}/${highImpact.length} repos...`);
      }
    });
  }

  // Store newly fetched data in cache
  if (cache) {
    for (const candidate of uncached) {
      const data = graph.get(candidate.moduleName);
      if (data) {
        cache.set(candidate.moduleName, data);
      }
    }
  }

  return graph;
}
