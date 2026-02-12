import type { Candidate } from "../types.ts";

/**
 * Well-known deprecated npm packages that still have significant download counts.
 * These are packages whose authors have explicitly marked them as deprecated
 * but remain in dependency trees across the ecosystem.
 *
 * This seed list is supplemented during the enrich step — any package found
 * to have the `deprecated` field set in npm registry metadata gets flagged.
 */
const KNOWN_DEPRECATED: Array<{
  moduleName: string;
  replacement: string;
}> = [
  { moduleName: "request", replacement: "undici or global fetch()" },
  { moduleName: "request-promise", replacement: "undici or global fetch()" },
  { moduleName: "request-promise-native", replacement: "undici or global fetch()" },
  { moduleName: "nomnom", replacement: "commander or node:util parseArgs()" },
  { moduleName: "colors", replacement: "picocolors or chalk" },
  { moduleName: "querystring", replacement: "URLSearchParams" },
  { moduleName: "domain", replacement: "AsyncLocalStorage" },
  { moduleName: "natives", replacement: "remove — no longer needed" },
  { moduleName: "tinycolor2", replacement: "@ctrl/tinycolor" },
  { moduleName: "stable", replacement: "Array.prototype.sort() (stable since Node 12)" },
  { moduleName: "flatten", replacement: "Array.prototype.flat()" },
  { moduleName: "circular-json", replacement: "flatted" },
  { moduleName: "left-pad", replacement: "String.prototype.padStart()" },
  { moduleName: "har-validator", replacement: "remove — no longer needed" },
  { moduleName: "osenv", replacement: "node:os" },
  { moduleName: "read-installed", replacement: "@npmcli/arborist" },
  { moduleName: "ini", replacement: "remove or inline parser" },
  { moduleName: "formidable", replacement: "busboy or @fastify/busboy" },
  { moduleName: "sane", replacement: "node:fs/promises watch()" },
  { moduleName: "chokidar", replacement: "node:fs/promises watch() (Node 20+)" },
  { moduleName: "core-js", replacement: "target modern engines only" },
  { moduleName: "urix", replacement: "remove — no longer needed" },
  { moduleName: "resolve-url", replacement: "remove — no longer needed" },
  { moduleName: "source-map-url", replacement: "remove — no longer needed" },
  { moduleName: "source-map-resolve", replacement: "remove — no longer needed" },
  { moduleName: "swagger-ui", replacement: "@scalar/api-reference or stoplight/elements" },
];

export async function getCandidates(): Promise<Candidate[]> {
  return KNOWN_DEPRECATED.map((entry) => ({
    moduleName: entry.moduleName,
    source: "deprecated" as const,
    replacementType: "remove" as const,
    replacement: entry.replacement,
  }));
}
