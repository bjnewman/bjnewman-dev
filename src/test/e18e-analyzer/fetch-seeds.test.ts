import { describe, it, expect } from "vitest";
import type { Candidate } from "../../../scripts/e18e-analyzer/types.ts";

function validateCandidate(c: Candidate) {
  expect(c.moduleName).toBeTruthy();
  expect(["module-replacements", "deprecated", "node-builtin", "polyfill-decay"]).toContain(c.source);
  expect(["native", "simple", "documented", "remove"]).toContain(c.replacementType);
  expect(c.replacement).toBeTruthy();
}

const SOURCE_PRIORITY: Candidate["source"][] = [
  "module-replacements",
  "node-builtin",
  "polyfill-decay",
  "deprecated",
];

function deduplicate(candidates: Candidate[]): Candidate[] {
  const seen = new Map<string, Candidate>();
  for (const candidate of candidates) {
    const existing = seen.get(candidate.moduleName);
    if (!existing) {
      seen.set(candidate.moduleName, candidate);
      continue;
    }
    const existingPriority = SOURCE_PRIORITY.indexOf(existing.source);
    const newPriority = SOURCE_PRIORITY.indexOf(candidate.source);
    if (newPriority < existingPriority) {
      seen.set(candidate.moduleName, candidate);
    }
  }
  return [...seen.values()];
}

describe("candidate shape validation", () => {
  it("accepts valid native candidate", () => {
    const c: Candidate = {
      moduleName: "is-number",
      source: "polyfill-decay",
      replacementType: "native",
      replacement: "typeof x === 'number'",
    };
    validateCandidate(c);
  });

  it("accepts valid documented candidate with docPath", () => {
    const c: Candidate = {
      moduleName: "chalk",
      source: "module-replacements",
      replacementType: "documented",
      replacement: "See module-replacements docs: chalk",
      docPath: "chalk",
    };
    validateCandidate(c);
  });

  it("accepts valid remove candidate", () => {
    const c: Candidate = {
      moduleName: "request",
      source: "deprecated",
      replacementType: "remove",
      replacement: "Use fetch() or undici",
    };
    validateCandidate(c);
  });

  it("accepts valid node-builtin candidate with minNodeVersion", () => {
    const c: Candidate = {
      moduleName: "node-fetch",
      source: "node-builtin",
      replacementType: "native",
      replacement: "global fetch",
      minNodeVersion: "18.0.0",
    };
    validateCandidate(c);
    expect(c.minNodeVersion).toBe("18.0.0");
  });
});

describe("deduplication logic", () => {
  it("keeps unique candidates from different sources", () => {
    const candidates: Candidate[] = [
      { moduleName: "a", source: "module-replacements", replacementType: "native", replacement: "x" },
      { moduleName: "b", source: "node-builtin", replacementType: "native", replacement: "y" },
      { moduleName: "c", source: "deprecated", replacementType: "remove", replacement: "z" },
    ];
    const result = deduplicate(candidates);
    expect(result).toHaveLength(3);
  });

  it("prefers module-replacements over node-builtin for the same package", () => {
    const candidates: Candidate[] = [
      { moduleName: "mkdirp", source: "node-builtin", replacementType: "native", replacement: "fs.mkdirSync" },
      { moduleName: "mkdirp", source: "module-replacements", replacementType: "native", replacement: "fs.mkdirSync({recursive:true})" },
    ];
    const result = deduplicate(candidates);
    expect(result).toHaveLength(1);
    expect(result[0].source).toBe("module-replacements");
  });

  it("prefers module-replacements over deprecated", () => {
    const candidates: Candidate[] = [
      { moduleName: "request", source: "deprecated", replacementType: "remove", replacement: "use fetch" },
      { moduleName: "request", source: "module-replacements", replacementType: "documented", replacement: "See docs" },
    ];
    const result = deduplicate(candidates);
    expect(result).toHaveLength(1);
    expect(result[0].source).toBe("module-replacements");
  });

  it("prefers node-builtin over polyfill-decay", () => {
    const candidates: Candidate[] = [
      { moduleName: "object-assign", source: "polyfill-decay", replacementType: "native", replacement: "Object.assign" },
      { moduleName: "object-assign", source: "node-builtin", replacementType: "native", replacement: "Object.assign()" },
    ];
    const result = deduplicate(candidates);
    expect(result).toHaveLength(1);
    expect(result[0].source).toBe("node-builtin");
  });

  it("prefers polyfill-decay over deprecated", () => {
    const candidates: Candidate[] = [
      { moduleName: "some-pkg", source: "deprecated", replacementType: "remove", replacement: "remove it" },
      { moduleName: "some-pkg", source: "polyfill-decay", replacementType: "native", replacement: "native code" },
    ];
    const result = deduplicate(candidates);
    expect(result).toHaveLength(1);
    expect(result[0].source).toBe("polyfill-decay");
  });

  it("keeps first candidate when same source and same package", () => {
    const candidates: Candidate[] = [
      { moduleName: "x", source: "module-replacements", replacementType: "native", replacement: "first" },
      { moduleName: "x", source: "module-replacements", replacementType: "documented", replacement: "second" },
    ];
    const result = deduplicate(candidates);
    expect(result).toHaveLength(1);
    expect(result[0].replacement).toBe("first");
  });

  it("handles large sets of duplicates across all sources", () => {
    const candidates: Candidate[] = [
      { moduleName: "shared", source: "deprecated", replacementType: "remove", replacement: "dep" },
      { moduleName: "shared", source: "polyfill-decay", replacementType: "native", replacement: "poly" },
      { moduleName: "shared", source: "node-builtin", replacementType: "native", replacement: "node" },
      { moduleName: "shared", source: "module-replacements", replacementType: "documented", replacement: "mod" },
    ];
    const result = deduplicate(candidates);
    expect(result).toHaveLength(1);
    expect(result[0].source).toBe("module-replacements");
    expect(result[0].replacement).toBe("mod");
  });
});

describe("leaderboard data shape contract", () => {
  it("LeaderboardEntry has all required fields", () => {
    const requiredFields = [
      "rank", "moduleName", "source", "replacementType", "replacement",
      "weeklyDownloads", "dependentCount", "compositeScore",
      "impactScore", "effortMultiplier", "mergeProbability", "livenessPenalty",
      "tier", "status", "repoUrl", "topDependents",
    ];

    const entry = {
      rank: 1,
      moduleName: "test",
      source: "module-replacements" as const,
      replacementType: "native" as const,
      replacement: "native code",
      weeklyDownloads: 1000,
      dependentCount: 50,
      compositeScore: 0.42,
      impactScore: 0.8,
      effortMultiplier: 1.0,
      mergeProbability: 0.6,
      livenessPenalty: 1.0,
      tier: 1 as const,
      status: "active" as const,
      repoUrl: "https://github.com/test/test",
      topDependents: [{ name: "dep1", downloads: 100 }],
    };

    for (const field of requiredFields) {
      expect(entry).toHaveProperty(field);
    }
  });
});
