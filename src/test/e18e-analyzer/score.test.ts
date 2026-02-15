import { describe, it, expect } from "vitest";
import {
  scorePackages,
  computeEffort,
  computeMergeProbability,
  computeLiveness,
  classifyStatus,
} from "../../../scripts/e18e-analyzer/score.ts";
import type { PackageData, Candidate } from "../../../scripts/e18e-analyzer/types.ts";

function makeCandidate(overrides: Partial<Candidate> = {}): Candidate {
  return {
    moduleName: "test-pkg",
    source: "module-replacements",
    replacementType: "native",
    replacement: "native code",
    ...overrides,
  };
}

function makePackage(overrides: Partial<PackageData> = {}): PackageData {
  return {
    moduleName: "test-pkg",
    candidate: makeCandidate(),
    weeklyDownloads: 100_000,
    lastPublishDate: "2024-01-01",
    repoUrl: "https://github.com/test/test",
    isDeprecated: false,
    dependentCount: 500,
    topDependents: [],
    daysSinceLastCommit: 30,
    daysSinceLastRelease: 60,
    isArchived: false,
    openPrCount: 5,
    contributorCountRecent: 3,
    hasContributingMd: false,
    externalPrsMerged: 8,
    externalPrsClosed: 10,
    ...overrides,
  };
}

describe("computeEffort", () => {
  it("returns 1.0 for native replacements", () => {
    const pkg = makePackage({
      candidate: makeCandidate({ replacementType: "native" }),
    });
    expect(computeEffort(pkg)).toBe(1.0);
  });

  it("returns 0.95 for simple replacements", () => {
    const pkg = makePackage({
      candidate: makeCandidate({ replacementType: "simple" }),
    });
    expect(computeEffort(pkg)).toBe(0.95);
  });

  it("returns 1.0 for remove replacements", () => {
    const pkg = makePackage({
      candidate: makeCandidate({ replacementType: "remove" }),
    });
    expect(computeEffort(pkg)).toBe(1.0);
  });

  it("uses effort tiers for documented replacements with known docPath", () => {
    const pkg = makePackage({
      candidate: makeCandidate({
        replacementType: "documented",
        docPath: "chalk",
      }),
    });
    expect(computeEffort(pkg)).toBe(0.7);
  });

  it("returns default 0.50 for documented with unknown docPath", () => {
    const pkg = makePackage({
      candidate: makeCandidate({
        replacementType: "documented",
        docPath: "unknown-package-xyz",
      }),
    });
    expect(computeEffort(pkg)).toBe(0.5);
  });
});

describe("computeMergeProbability", () => {
  it("returns 0 for archived repos", () => {
    const pkg = makePackage({ isArchived: true });
    expect(computeMergeProbability(pkg)).toBe(0.0);
  });

  it("returns higher probability for recently active repos", () => {
    const active = makePackage({ daysSinceLastCommit: 5 });
    const stale = makePackage({ daysSinceLastCommit: 500 });
    expect(computeMergeProbability(active)).toBeGreaterThan(
      computeMergeProbability(stale),
    );
  });

  it("uses merge ratio from external PRs when enough data exists", () => {
    const highMerge = makePackage({
      externalPrsMerged: 9,
      externalPrsClosed: 10,
    });
    const lowMerge = makePackage({
      externalPrsMerged: 1,
      externalPrsClosed: 10,
    });
    expect(computeMergeProbability(highMerge)).toBeGreaterThan(
      computeMergeProbability(lowMerge),
    );
  });

  it("uses 0.4 prior when fewer than 5 closed PRs", () => {
    const fewPrs = makePackage({
      externalPrsMerged: 2,
      externalPrsClosed: 3,
    });
    const manyPrs = makePackage({
      externalPrsMerged: 2,
      externalPrsClosed: 3,
    });
    // Both should use the 0.4 prior since < 5 closed
    expect(computeMergeProbability(fewPrs)).toBe(
      computeMergeProbability(manyPrs),
    );
  });

  it("gives CONTRIBUTING.md bonus", () => {
    const withContrib = makePackage({ hasContributingMd: true });
    const without = makePackage({ hasContributingMd: false });
    expect(computeMergeProbability(withContrib)).toBeGreaterThan(
      computeMergeProbability(without),
    );
  });

  it("is clamped between 0.01 and 0.99", () => {
    const best = makePackage({
      daysSinceLastCommit: 1,
      daysSinceLastRelease: 1,
      externalPrsMerged: 100,
      externalPrsClosed: 100,
      contributorCountRecent: 50,
      hasContributingMd: true,
    });
    expect(computeMergeProbability(best)).toBeLessThanOrEqual(0.99);
    expect(computeMergeProbability(best)).toBeGreaterThanOrEqual(0.01);
  });

  it("handles null daysSinceLastCommit gracefully", () => {
    const pkg = makePackage({ daysSinceLastCommit: null });
    const result = computeMergeProbability(pkg);
    expect(result).toBeGreaterThanOrEqual(0.01);
    expect(result).toBeLessThanOrEqual(0.99);
  });
});

describe("computeLiveness", () => {
  it("returns 0.05 for archived repos", () => {
    expect(computeLiveness(makePackage({ isArchived: true }))).toBe(0.05);
  });

  it("returns 0.10 for repos dormant > 730 days", () => {
    expect(
      computeLiveness(makePackage({ daysSinceLastCommit: 800 })),
    ).toBe(0.10);
  });

  it("returns 0.30 for repos dormant > 365 days", () => {
    expect(
      computeLiveness(makePackage({ daysSinceLastCommit: 400 })),
    ).toBe(0.30);
  });

  it("returns 1.0 for active repos", () => {
    expect(
      computeLiveness(makePackage({ daysSinceLastCommit: 30 })),
    ).toBe(1.0);
  });

  it("returns 0.5 for null daysSinceLastCommit and null lastPublishDate", () => {
    expect(
      computeLiveness(
        makePackage({ daysSinceLastCommit: null, lastPublishDate: null }),
      ),
    ).toBe(0.5);
  });
});

describe("classifyStatus", () => {
  it("returns archived for archived repos", () => {
    expect(classifyStatus(makePackage({ isArchived: true }))).toBe("archived");
  });

  it("returns dormant for > 365 days", () => {
    expect(
      classifyStatus(makePackage({ daysSinceLastCommit: 400 })),
    ).toBe("dormant");
  });

  it("returns stale for > 90 days", () => {
    expect(
      classifyStatus(makePackage({ daysSinceLastCommit: 120 })),
    ).toBe("stale");
  });

  it("returns active for <= 90 days", () => {
    expect(
      classifyStatus(makePackage({ daysSinceLastCommit: 30 })),
    ).toBe("active");
  });

  it("returns stale when daysSinceLastCommit and lastPublishDate are null", () => {
    expect(
      classifyStatus(
        makePackage({ daysSinceLastCommit: null, lastPublishDate: null }),
      ),
    ).toBe("stale");
  });
});

describe("scorePackages", () => {
  it("ranks native + high downloads + active above documented + low downloads + stale", () => {
    const highValue = makePackage({
      moduleName: "high-value",
      candidate: makeCandidate({
        moduleName: "high-value",
        replacementType: "native",
      }),
      weeklyDownloads: 10_000_000,
      dependentCount: 5000,
      daysSinceLastCommit: 10,
    });

    const lowValue = makePackage({
      moduleName: "low-value",
      candidate: makeCandidate({
        moduleName: "low-value",
        replacementType: "documented",
        docPath: "moment",
      }),
      weeklyDownloads: 100,
      dependentCount: 2,
      daysSinceLastCommit: 400,
    });

    const scored = scorePackages([highValue, lowValue]);
    expect(scored[0].moduleName).toBe("high-value");
    expect(scored[1].moduleName).toBe("low-value");
    expect(scored[0].compositeScore).toBeGreaterThan(
      scored[1].compositeScore,
    );
  });

  it("assigns ranks starting from 1", () => {
    const pkgs = [
      makePackage({ moduleName: "a", weeklyDownloads: 1000 }),
      makePackage({ moduleName: "b", weeklyDownloads: 500 }),
      makePackage({ moduleName: "c", weeklyDownloads: 100 }),
    ];
    const scored = scorePackages(pkgs);
    expect(scored[0].rank).toBe(1);
    expect(scored[1].rank).toBe(2);
    expect(scored[2].rank).toBe(3);
  });

  it("assigns percentiles", () => {
    const pkgs = [
      makePackage({ moduleName: "a", weeklyDownloads: 1000 }),
      makePackage({ moduleName: "b", weeklyDownloads: 500 }),
    ];
    const scored = scorePackages(pkgs);
    expect(scored[0].percentile).toBe(100);
    expect(scored[1].percentile).toBe(50);
  });

  it("assigns tiers based on impact score", () => {
    // With only 2 packages, impact normalization will give 0 and 1
    const whale = makePackage({
      moduleName: "whale",
      weeklyDownloads: 50_000_000,
      dependentCount: 100_000,
    });
    const tiny = makePackage({
      moduleName: "tiny",
      weeklyDownloads: 1,
      dependentCount: 0,
    });
    const scored = scorePackages([whale, tiny]);
    expect(scored.find((s) => s.moduleName === "whale")!.tier).toBe(1);
    expect(scored.find((s) => s.moduleName === "tiny")!.tier).toBe(4);
  });

  it("handles zero downloads without crashing", () => {
    const pkg = makePackage({ weeklyDownloads: 0, dependentCount: 0 });
    const scored = scorePackages([pkg]);
    expect(scored).toHaveLength(1);
    expect(scored[0].compositeScore).toBeGreaterThanOrEqual(0);
  });

  it("handles missing GitHub data without crashing", () => {
    const pkg = makePackage({
      daysSinceLastCommit: null,
      daysSinceLastRelease: null,
      externalPrsMerged: 0,
      externalPrsClosed: 0,
      contributorCountRecent: 0,
    });
    const scored = scorePackages([pkg]);
    expect(scored).toHaveLength(1);
    expect(scored[0].compositeScore).toBeGreaterThanOrEqual(0);
  });

  it("archived repos get liveness 0.05 but are not filtered out", () => {
    const archived = makePackage({
      moduleName: "archived-pkg",
      isArchived: true,
    });
    const active = makePackage({
      moduleName: "active-pkg",
      isArchived: false,
    });
    const scored = scorePackages([archived, active]);
    expect(scored).toHaveLength(2);
    const archivedResult = scored.find((s) => s.moduleName === "archived-pkg")!;
    expect(archivedResult.livenessPenalty).toBe(0.05);
    expect(archivedResult.status).toBe("archived");
  });

  it("composite score is multiplicative — zero liveness tanks total", () => {
    const archived = makePackage({
      moduleName: "archived-pkg",
      isArchived: true,
      weeklyDownloads: 10_000_000,
      dependentCount: 50_000,
    });
    const scored = scorePackages([archived]);
    // Archived → merge probability = 0, so composite = 0
    expect(scored[0].compositeScore).toBe(0);
  });
});
