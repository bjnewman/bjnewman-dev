import { useState, useMemo } from "react";
import type { LeaderboardEntry } from "./data/leaderboard";
import { PackageRow } from "./PackageRow";

type SortColumn =
  | "rank"
  | "moduleName"
  | "weeklyDownloads"
  | "dependentCount"
  | "compositeScore";
type SortDirection = "asc" | "desc";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

const COLUMN_LABELS: Record<SortColumn, string> = {
  rank: "#",
  moduleName: "Package",
  weeklyDownloads: "Downloads/wk",
  dependentCount: "Dependents",
  compositeScore: "Score",
};

export function Leaderboard({ entries }: LeaderboardProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("compositeScore");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => {
      let cmp: number;
      switch (sortColumn) {
        case "rank":
          cmp = a.rank - b.rank;
          break;
        case "moduleName":
          cmp = a.moduleName.localeCompare(b.moduleName);
          break;
        case "weeklyDownloads":
          cmp = a.weeklyDownloads - b.weeklyDownloads;
          break;
        case "dependentCount":
          cmp = a.dependentCount - b.dependentCount;
          break;
        case "compositeScore":
          cmp = a.compositeScore - b.compositeScore;
          break;
        default:
          cmp = 0;
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [entries, sortColumn, sortDirection]);

  function handleSort(column: SortColumn) {
    if (column === sortColumn) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection(column === "moduleName" ? "asc" : "desc");
    }
  }

  function renderHeader(column: SortColumn) {
    const isActive = sortColumn === column;
    const arrow = isActive ? (sortDirection === "asc" ? " \u2191" : " \u2193") : "";
    return (
      <th
        className={`e18e__th e18e__th--${column} ${isActive ? "e18e__th--active" : ""}`}
        onClick={() => handleSort(column)}
        role="columnheader"
        aria-sort={
          isActive
            ? sortDirection === "asc"
              ? "ascending"
              : "descending"
            : "none"
        }
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSort(column);
        }}
      >
        {COLUMN_LABELS[column]}
        {arrow}
      </th>
    );
  }

  return (
    <div className="e18e__leaderboard-wrapper">
      <table className="e18e__table" role="grid">
        <thead>
          <tr>
            {renderHeader("rank")}
            {renderHeader("moduleName")}
            <th className="e18e__th e18e__th--replacement">Replace With</th>
            {renderHeader("weeklyDownloads")}
            {renderHeader("dependentCount")}
            {renderHeader("compositeScore")}
            <th className="e18e__th e18e__th--status">Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((entry) => (
            <PackageRow
              key={entry.moduleName}
              entry={entry}
              isExpanded={expandedRow === entry.moduleName}
              onToggle={() =>
                setExpandedRow(
                  expandedRow === entry.moduleName
                    ? null
                    : entry.moduleName,
                )
              }
            />
          ))}
        </tbody>
      </table>
      {sorted.length === 0 && (
        <p className="e18e__empty">No packages match your filters.</p>
      )}
    </div>
  );
}
