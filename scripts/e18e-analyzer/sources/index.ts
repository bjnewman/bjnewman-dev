import type { Candidate } from "../types.ts";
import { getCandidates as getModuleReplacements } from "./module-replacements.ts";
import { getCandidates as getNodeBuiltins } from "./node-builtins.ts";
import { getCandidates as getPolyfillDecay } from "./polyfill-decay.ts";
import { getCandidates as getDeprecated } from "./deprecated.ts";

/**
 * Priority order for deduplication — when the same moduleName appears
 * in multiple sources, prefer the source with more specific info.
 * Lower index = higher priority.
 */
const SOURCE_PRIORITY: Candidate["source"][] = [
  "module-replacements",
  "node-builtin",
  "polyfill-decay",
  "deprecated",
];

/**
 * Gather candidates from all sources and deduplicate by moduleName.
 * When duplicates exist, keep the candidate from the highest-priority source.
 */
export async function gatherCandidates(): Promise<Candidate[]> {
  const [moduleReplacements, nodeBuiltins, polyfillDecay, deprecated] =
    await Promise.all([
      getModuleReplacements(),
      getNodeBuiltins(),
      getPolyfillDecay(),
      getDeprecated(),
    ]);

  const all = [
    ...moduleReplacements,
    ...nodeBuiltins,
    ...polyfillDecay,
    ...deprecated,
  ];

  // Deduplicate: keep highest-priority source per moduleName
  const seen = new Map<string, Candidate>();

  for (const candidate of all) {
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

  const candidates = [...seen.values()];
  console.log(
    `  Sources: ${moduleReplacements.length} module-replacements, ` +
      `${nodeBuiltins.length} node-builtins, ` +
      `${polyfillDecay.length} polyfill-decay, ` +
      `${deprecated.length} deprecated`,
  );
  console.log(
    `  After deduplication: ${candidates.length} unique candidates`,
  );

  return candidates;
}
