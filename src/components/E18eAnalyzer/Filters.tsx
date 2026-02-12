import type { CandidateSource, PackageStatus, Tier } from "./data/leaderboard";

export interface ActiveFilters {
  search: string;
  sources: CandidateSource[];
  tiers: Tier[];
  statuses: PackageStatus[];
}

interface FiltersProps {
  filters: ActiveFilters;
  onChange: (filters: ActiveFilters) => void;
  resultCount: number;
}

const SOURCE_LABELS: Record<CandidateSource, string> = {
  "module-replacements": "module-replacements",
  deprecated: "deprecated",
  "node-builtin": "node built-in",
  "polyfill-decay": "polyfill decay",
};

const STATUS_LABELS: Record<PackageStatus, string> = {
  active: "Active",
  stale: "Stale",
  dormant: "Dormant",
  archived: "Archived",
};

const ALL_SOURCES: CandidateSource[] = [
  "module-replacements",
  "deprecated",
  "node-builtin",
  "polyfill-decay",
];

const ALL_STATUSES: PackageStatus[] = ["active", "stale", "dormant", "archived"];
const ALL_TIERS: Tier[] = [1, 2, 3, 4];

function toggleItem<T>(arr: T[], item: T): T[] {
  return arr.includes(item)
    ? arr.filter((x) => x !== item)
    : [...arr, item];
}

export function Filters({ filters, onChange, resultCount }: FiltersProps) {
  return (
    <div className="e18e__filters" role="search" aria-label="Filter packages">
      <input
        className="e18e__search"
        type="search"
        placeholder="Search packages..."
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        aria-label="Search by package name"
      />

      <div className="e18e__filter-group">
        <span className="e18e__filter-label">Source</span>
        <div className="e18e__chips">
          {ALL_SOURCES.map((source) => (
            <button
              key={source}
              className={`e18e__chip e18e__chip--source ${filters.sources.includes(source) ? "e18e__chip--active" : ""}`}
              onClick={() =>
                onChange({
                  ...filters,
                  sources: toggleItem(filters.sources, source),
                })
              }
              aria-pressed={filters.sources.includes(source)}
            >
              {SOURCE_LABELS[source]}
            </button>
          ))}
        </div>
      </div>

      <div className="e18e__filter-group">
        <span className="e18e__filter-label">Tier</span>
        <div className="e18e__chips">
          {ALL_TIERS.map((tier) => (
            <button
              key={tier}
              className={`e18e__chip e18e__chip--tier ${filters.tiers.includes(tier) ? "e18e__chip--active" : ""}`}
              onClick={() =>
                onChange({
                  ...filters,
                  tiers: toggleItem(filters.tiers, tier),
                })
              }
              aria-pressed={filters.tiers.includes(tier)}
            >
              T{tier}
            </button>
          ))}
        </div>
      </div>

      <div className="e18e__filter-group">
        <span className="e18e__filter-label">Status</span>
        <div className="e18e__chips">
          {ALL_STATUSES.map((status) => (
            <button
              key={status}
              className={`e18e__chip e18e__chip--status ${filters.statuses.includes(status) ? "e18e__chip--active" : ""}`}
              onClick={() =>
                onChange({
                  ...filters,
                  statuses: toggleItem(filters.statuses, status),
                })
              }
              aria-pressed={filters.statuses.includes(status)}
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      <span className="e18e__result-count" aria-live="polite">
        {resultCount} package{resultCount !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
