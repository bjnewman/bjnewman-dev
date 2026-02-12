import type { Stats } from "./data/leaderboard";

interface StatsBarProps {
  stats: Stats;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const days = Math.floor(
    (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="e18e__stats-bar" role="region" aria-label="Summary statistics">
      <div className="e18e__stat-card">
        <span className="e18e__stat-value">{stats.totalPackages}</span>
        <span className="e18e__stat-label">Packages Analyzed</span>
      </div>
      <div className="e18e__stat-card">
        <span className="e18e__stat-value">
          {formatNumber(stats.totalDownloadsRepresented)}
        </span>
        <span className="e18e__stat-label">Weekly Downloads</span>
      </div>
      <div className="e18e__stat-card">
        <span className="e18e__stat-value">
          {stats.activeOpportunities}
        </span>
        <span className="e18e__stat-label">Active Opportunities</span>
      </div>
      <div className="e18e__stat-card">
        <span className="e18e__stat-value">
          {timeAgo(stats.lastUpdated)}
        </span>
        <span className="e18e__stat-label">Last Updated</span>
      </div>
    </div>
  );
}
