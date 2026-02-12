import { useState, useMemo } from "react";
import { leaderboard, stats } from "./data/leaderboard";
import type { LeaderboardEntry } from "./data/leaderboard";
import { StatsBar } from "./StatsBar";
import { Filters, type ActiveFilters } from "./Filters";
import { Leaderboard } from "./Leaderboard";

const INITIAL_FILTERS: ActiveFilters = {
  search: "",
  sources: [],
  tiers: [],
  statuses: [],
};

function filterEntries(
  entries: LeaderboardEntry[],
  filters: ActiveFilters,
): LeaderboardEntry[] {
  return entries.filter((entry) => {
    if (
      filters.search &&
      !entry.moduleName.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    if (
      filters.sources.length > 0 &&
      !filters.sources.includes(entry.source)
    ) {
      return false;
    }
    if (filters.tiers.length > 0 && !filters.tiers.includes(entry.tier)) {
      return false;
    }
    if (
      filters.statuses.length > 0 &&
      !filters.statuses.includes(entry.status)
    ) {
      return false;
    }
    return true;
  });
}

export function E18eAnalyzer() {
  const [filters, setFilters] = useState<ActiveFilters>(INITIAL_FILTERS);

  const filtered = useMemo(
    () => filterEntries(leaderboard, filters),
    [filters],
  );

  return (
    <div className="e18e">
      <header className="e18e__header">
        <h1 className="e18e__title">🔍 OSS Analyzer</h1>
        <p className="e18e__subtitle">
          Find the highest-impact PRs to modernize the npm ecosystem. Ranked by
          downloads, dependents, maintainer health, and fix complexity.
        </p>
        <p className="e18e__subtitle-secondary">
          This tool helps identify deprecated or outdated npm packages that have
          high impact and are good candidates for modernization PRs.
        </p>
      </header>

      <StatsBar stats={stats} />

      <Filters
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
      />

      <Leaderboard entries={filtered} />

      <footer className="e18e__footer">
        <a
          href="/e18e/data/ecosystem.db"
          download
          className="e18e__download-link"
        >
          Download SQLite database for local analysis
        </a>
        <p className="e18e__methodology">
          Scores are multiplicative: impact &times; effort &times; merge
          probability &times; liveness. A zero in any dimension zeros the total.
        </p>
      </footer>
    </div>
  );
}
