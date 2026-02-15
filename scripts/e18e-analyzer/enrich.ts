import type { Candidate, PackageData } from "./types.ts";
import type { GraphData } from "./expand-graph.ts";
import { createRateLimiter, parallelMap } from "./utils/rate-limiter.ts";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// npm rate limits aggressively on bursts — stay conservative
const npmFetch = createRateLimiter(100);
// GitHub: 5000/hr with token
const githubFetch = createRateLimiter(GITHUB_TOKEN ? 4500 : 55);

// ── npm enrichment ──────────────────────────────────────────────────

/**
 * Bulk fetch weekly downloads for up to 128 packages at once.
 * npm bulk API does NOT support scoped packages (@scope/pkg) —
 * the slash is interpreted as a path separator and returns 400.
 * Scoped packages are fetched individually.
 */
async function fetchBulkDownloads(
  packageNames: string[],
): Promise<Map<string, number>> {
  const results = new Map<string, number>();

  // Separate scoped packages — bulk API can't handle them
  const unscoped = packageNames.filter((n) => !n.startsWith("@"));
  const scoped = packageNames.filter((n) => n.startsWith("@"));

  // Bulk-fetch unscoped packages in chunks of 128
  const chunks: string[][] = [];
  for (let i = 0; i < unscoped.length; i += 128) {
    chunks.push(unscoped.slice(i, i + 128));
  }

  for (const chunk of chunks) {
    // npm downloads API expects raw package names (no URI encoding)
    const names = chunk.join(",");
    const url = `https://api.npmjs.org/downloads/point/last-week/${names}`;
    try {
      const response = await npmFetch(url);
      if (!response.ok) {
        console.warn(`  Bulk download fetch failed (${response.status}), fetching individually...`);
        for (const name of chunk) {
          results.set(name, await fetchSingleDownloads(name));
        }
        continue;
      }
      const data = (await response.json()) as Record<
        string,
        { downloads: number } | null
      >;
      for (const name of chunk) {
        results.set(name, data[name]?.downloads ?? 0);
      }
    } catch {
      for (const name of chunk) results.set(name, 0);
    }
  }

  // Fetch scoped packages individually
  for (const name of scoped) {
    results.set(name, await fetchSingleDownloads(name));
  }

  return results;
}

async function fetchSingleDownloads(packageName: string): Promise<number> {
  try {
    // npm downloads API expects raw package names — scoped names use literal @ and /
    const url = `https://api.npmjs.org/downloads/point/last-week/${packageName}`;
    const response = await npmFetch(url);
    if (!response.ok) return 0;
    const data = (await response.json()) as { downloads: number };
    return data.downloads ?? 0;
  } catch {
    return 0;
  }
}

interface NpmPackageMetadata {
  repoUrl: string | null;
  lastPublishDate: string | null;
  isDeprecated: boolean;
}

/**
 * Fetch package metadata from npm registry.
 * Uses abbreviated metadata endpoint for speed.
 */
async function fetchNpmMetadata(
  packageName: string,
): Promise<NpmPackageMetadata> {
  try {
    const url = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;
    const response = await npmFetch(url);
    if (!response.ok)
      return { repoUrl: null, lastPublishDate: null, isDeprecated: false };
    const data = (await response.json()) as Record<string, unknown>;

    // Extract repo URL
    let repoUrl: string | null = null;
    const repo = data.repository as
      | { url?: string; type?: string }
      | string
      | undefined;
    if (typeof repo === "string") {
      repoUrl = normalizeGitUrl(repo);
    } else if (repo?.url) {
      repoUrl = normalizeGitUrl(repo.url);
    }

    // Extract last publish date
    const time = data.time as Record<string, string> | undefined;
    const lastPublishDate = time?.modified ?? null;

    // Check deprecated — can be on latest version or top-level
    const distTags = data["dist-tags"] as Record<string, string> | undefined;
    const latestVersion = distTags?.latest;
    const versions = data.versions as Record<string, { deprecated?: string }> | undefined;
    const isDeprecated = !!(
      latestVersion && versions?.[latestVersion]?.deprecated
    );

    return { repoUrl, lastPublishDate, isDeprecated };
  } catch {
    return { repoUrl: null, lastPublishDate: null, isDeprecated: false };
  }
}

function normalizeGitUrl(url: string): string | null {
  // git+https://github.com/user/repo.git → https://github.com/user/repo
  let normalized = url
    .replace(/^git\+/, "")
    .replace(/^git:\/\//, "https://")
    .replace(/\.git$/, "")
    .replace(/^ssh:\/\/git@github\.com/, "https://github.com");

  if (normalized.startsWith("github:")) {
    normalized = `https://github.com/${normalized.slice(7)}`;
  }

  // Only keep GitHub URLs for now (we query GitHub API)
  if (normalized.includes("github.com")) return normalized;
  return null;
}

// ── GitHub enrichment ───────────────────────────────────────────────

export interface GitHubData {
  daysSinceLastCommit: number | null;
  daysSinceLastRelease: number | null;
  isArchived: boolean;
  openPrCount: number;
  contributorCountRecent: number;
  hasContributingMd: boolean;
  externalPrsMerged: number;
  externalPrsClosed: number;
}

export const EMPTY_GITHUB: GitHubData = {
  daysSinceLastCommit: null,
  daysSinceLastRelease: null,
  isArchived: false,
  openPrCount: 0,
  contributorCountRecent: 0,
  hasContributingMd: false,
  externalPrsMerged: 0,
  externalPrsClosed: 0,
};

function parseGitHubOwnerRepo(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

async function ghApi(path: string): Promise<unknown | null> {
  if (!GITHUB_TOKEN) return null;
  try {
    const response = await githubFetch(`https://api.github.com${path}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "e18e-analyzer",
      },
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

function daysSince(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export async function fetchGitHubData(repoUrl: string): Promise<GitHubData> {
  const parsed = parseGitHubOwnerRepo(repoUrl);
  if (!parsed || !GITHUB_TOKEN) return EMPTY_GITHUB;

  const { owner, repo } = parsed;

  // Fetch repo metadata + closed PRs in parallel
  const [repoData, closedPrs] = await Promise.all([
    ghApi(`/repos/${owner}/${repo}`) as Promise<{
      archived: boolean;
      open_issues_count: number;
      pushed_at: string;
      has_contributing?: boolean;
    } | null>,
    ghApi(
      `/repos/${owner}/${repo}/pulls?state=closed&per_page=100&sort=updated&direction=desc`,
    ) as Promise<
      Array<{
        user: { login: string };
        merged_at: string | null;
        author_association: string;
      }> | null
    >,
  ]);

  if (!repoData) return EMPTY_GITHUB;

  // Get latest release date
  const releases = (await ghApi(
    `/repos/${owner}/${repo}/releases?per_page=1`,
  )) as Array<{ published_at: string }> | null;

  // Count external PRs (non-OWNER, non-MEMBER, non-COLLABORATOR)
  const internalAssociations = new Set([
    "OWNER",
    "MEMBER",
    "COLLABORATOR",
  ]);
  let externalMerged = 0;
  let externalClosed = 0;

  if (closedPrs) {
    for (const pr of closedPrs) {
      if (internalAssociations.has(pr.author_association)) continue;
      externalClosed++;
      if (pr.merged_at) externalMerged++;
    }
  }

  // Check for CONTRIBUTING.md
  const contributing = await ghApi(
    `/repos/${owner}/${repo}/contents/CONTRIBUTING.md`,
  );

  return {
    daysSinceLastCommit: daysSince(repoData.pushed_at),
    daysSinceLastRelease: daysSince(releases?.[0]?.published_at),
    isArchived: repoData.archived,
    openPrCount: repoData.open_issues_count, // includes issues, but close enough
    contributorCountRecent: 0, // would need additional API call, skip for v1
    hasContributingMd: contributing !== null,
    externalPrsMerged: externalMerged,
    externalPrsClosed: externalClosed,
  };
}

// ── Main enrich function ────────────────────────────────────────────

export async function enrich(
  candidates: Candidate[],
  graph: Map<string, GraphData>,
): Promise<PackageData[]> {
  const packageNames = candidates.map((c) => c.moduleName);

  // Step 1: Bulk download counts
  console.log("  Fetching download counts...");
  const downloads = await fetchBulkDownloads(packageNames);

  // Step 2: npm metadata (repo URL, last publish, deprecated) — parallel
  console.log(`  Fetching npm metadata for ${candidates.length} packages...`);
  const npmMeta = new Map<string, NpmPackageMetadata>();
  let completed = 0;
  await parallelMap(packageNames, 10, async (name) => {
    npmMeta.set(name, await fetchNpmMetadata(name));
    completed++;
    if (completed % 100 === 0) {
      console.log(`  ${completed}/${packageNames.length} metadata...`);
    }
  });

  // Step 3: GitHub data (if token available)
  const githubData = new Map<string, GitHubData>();
  if (GITHUB_TOKEN) {
    // Collect unique repo URLs
    const repoUrlToPackages = new Map<string, string[]>();
    for (const name of packageNames) {
      const meta = npmMeta.get(name);
      if (meta?.repoUrl) {
        const existing = repoUrlToPackages.get(meta.repoUrl) || [];
        existing.push(name);
        repoUrlToPackages.set(meta.repoUrl, existing);
      }
    }

    const repoEntries = [...repoUrlToPackages.entries()];
    console.log(
      `  Fetching GitHub data for ${repoEntries.length} unique repos...`,
    );
    let ghCompleted = 0;
    await parallelMap(repoEntries, 10, async ([repoUrl, names]) => {
      const data = await fetchGitHubData(repoUrl);
      for (const name of names) {
        githubData.set(name, data);
      }
      ghCompleted++;
      if (ghCompleted % 50 === 0) {
        console.log(`  ${ghCompleted}/${repoEntries.length} repos...`);
      }
    });
  } else {
    console.log("  No GITHUB_TOKEN — skipping GitHub enrichment");
  }

  // Assemble PackageData
  return candidates.map((candidate) => {
    const name = candidate.moduleName;
    const graphData = graph.get(name);
    const meta = npmMeta.get(name);
    const gh = githubData.get(name) || EMPTY_GITHUB;

    return {
      moduleName: name,
      candidate,
      weeklyDownloads: downloads.get(name) ?? 0,
      lastPublishDate: meta?.lastPublishDate ?? null,
      repoUrl: meta?.repoUrl ?? null,
      isDeprecated: meta?.isDeprecated ?? false,
      dependentCount: graphData?.dependentCount ?? 0,
      topDependents: (graphData?.topDependentRepos ?? []).map((r) => ({
        name: r.name,
        downloads: r.stars, // Using stars as proxy since we don't have dep downloads
      })),
      ...gh,
    };
  });
}
