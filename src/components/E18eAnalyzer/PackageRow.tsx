import type { LeaderboardEntry } from "./data/leaderboard";

interface PackageRowProps {
  entry: LeaderboardEntry;
  isExpanded: boolean;
  onToggle: () => void;
}

function formatDownloads(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function ScoreBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(value * 100);
  return (
    <div className="e18e__score-bar">
      <span className="e18e__score-bar-label">{label}</span>
      <div className="e18e__score-bar-track">
        <div
          className="e18e__score-bar-fill"
          style={{ width: `${pct}%` }}
          role="meter"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${pct}%`}
        />
      </div>
      <span className="e18e__score-bar-value">{pct}%</span>
    </div>
  );
}

export function PackageRow({ entry, isExpanded, onToggle }: PackageRowProps) {
  return (
    <>
      <tr
        className={`e18e__row e18e__row--tier-${entry.tier}`}
        onClick={onToggle}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        aria-expanded={isExpanded}
      >
        <td className="e18e__cell e18e__cell--rank">{entry.rank}</td>
        <td className="e18e__cell e18e__cell--name">
          <span className="e18e__package-name">{entry.moduleName}</span>
          <span className={`e18e__source-badge e18e__source-badge--${entry.source}`}>
            {entry.source === "module-replacements"
              ? "mod-replace"
              : entry.source === "node-builtin"
                ? "node"
                : entry.source === "polyfill-decay"
                  ? "polyfill"
                  : entry.source}
          </span>
        </td>
        <td className="e18e__cell e18e__cell--replacement">{entry.replacement}</td>
        <td className="e18e__cell e18e__cell--downloads">
          {formatDownloads(entry.weeklyDownloads)}
        </td>
        <td className="e18e__cell e18e__cell--dependents">
          {formatDownloads(entry.dependentCount)}
        </td>
        <td className="e18e__cell e18e__cell--score">
          {(entry.compositeScore * 100).toFixed(1)}
        </td>
        <td className="e18e__cell e18e__cell--status">
          <span className={`e18e__status e18e__status--${entry.status}`}>
            {entry.status}
          </span>
        </td>
      </tr>
      {isExpanded && (
        <tr className="e18e__detail-row">
          <td colSpan={7}>
            <div className="e18e__detail">
              <div className="e18e__detail-scores">
                <h4 className="e18e__detail-heading">Score Breakdown</h4>
                <ScoreBar value={entry.impactScore} label="Impact" />
                <ScoreBar value={entry.effortMultiplier} label="Effort" />
                <ScoreBar value={entry.mergeProbability} label="Merge Prob." />
                <ScoreBar value={entry.livenessPenalty} label="Liveness" />
              </div>
              <div className="e18e__detail-links">
                <h4 className="e18e__detail-heading">Links</h4>
                <a
                  href={`https://www.npmjs.com/package/${entry.moduleName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  npm
                </a>
                {entry.repoUrl && (
                  <a
                    href={entry.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </a>
                )}
              </div>
              {entry.topDependents.length > 0 && (
                <div className="e18e__detail-dependents">
                  <h4 className="e18e__detail-heading">Top Dependents</h4>
                  <ul>
                    {entry.topDependents.map((dep) => (
                      <li key={dep.name}>
                        <a
                          href={`https://github.com/${dep.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {dep.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
