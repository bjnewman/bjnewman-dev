export type CandidateSource =
  | "module-replacements"
  | "deprecated"
  | "node-builtin"
  | "polyfill-decay";

export type ReplacementType = "native" | "simple" | "documented" | "remove";

export interface Candidate {
  moduleName: string;
  source: CandidateSource;
  replacementType: ReplacementType;
  replacement: string;
  docPath?: string;
  minNodeVersion?: string;
}

export interface PackageData {
  moduleName: string;
  candidate: Candidate;

  // npm
  weeklyDownloads: number;
  lastPublishDate: string | null;
  repoUrl: string | null;
  isDeprecated: boolean;

  // libraries.io
  dependentCount: number;
  topDependents: Array<{ name: string; downloads: number }>;

  // GitHub (null if no repo or no token)
  daysSinceLastCommit: number | null;
  daysSinceLastRelease: number | null;
  isArchived: boolean;
  openPrCount: number;
  contributorCountRecent: number;
  hasContributingMd: boolean;
  externalPrsMerged: number;
  externalPrsClosed: number;
}

export type PackageStatus = "archived" | "dormant" | "stale" | "active";
export type Tier = 1 | 2 | 3 | 4;

export interface ScoredPackage extends PackageData {
  impactScore: number;
  effortMultiplier: number;
  mergeProbability: number;
  livenessPenalty: number;
  compositeScore: number;

  tier: Tier;
  status: PackageStatus;
  rank: number;
  percentile: number;
  computedAt: string;
}

// ── Target repo types (second pass) ──────────────────────────────────

/** A single replaceable dep found in a target repo */
export interface ReplacementOpportunity {
  moduleName: string;
  replacement: string;
  replacementType: ReplacementType;
  effortMultiplier: number;
  weeklyDownloads: number;
}

/** Raw target repo before scoring */
export interface TargetRepo {
  repoFullName: string;
  repoUrl: string;
  stars: number;
  pushedAt: string | null;
  opportunities: ReplacementOpportunity[];
  daysSinceLastCommit: number | null;
  daysSinceLastRelease: number | null;
  isArchived: boolean;
  openPrCount: number;
  contributorCountRecent: number;
  hasContributingMd: boolean;
  externalPrsMerged: number;
  externalPrsClosed: number;
}

/** Scored target repo */
export interface ScoredTargetRepo extends TargetRepo {
  reachScore: number;
  receptivenessScore: number;
  bundleOpportunity: number;
  aggregateEffort: number;
  compositeScore: number;
  rank: number;
  computedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  moduleName: string;
  source: CandidateSource;
  replacementType: ReplacementType;
  replacement: string;
  weeklyDownloads: number;
  dependentCount: number;
  compositeScore: number;
  impactScore: number;
  effortMultiplier: number;
  mergeProbability: number;
  livenessPenalty: number;
  tier: Tier;
  status: PackageStatus;
  repoUrl: string | null;
  topDependents: Array<{ name: string; downloads: number }>;
}

export interface Stats {
  lastUpdated: string;
  totalPackages: number;
  totalDownloadsRepresented: number;
  activeOpportunities: number;
  bySource: Record<CandidateSource, number>;
  byTier: Record<Tier, number>;
  byStatus: Record<PackageStatus, number>;
}
