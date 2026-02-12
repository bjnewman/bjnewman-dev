import type { Candidate } from "../types.ts";

/**
 * Packages that duplicate functionality now available in Node.js core.
 * Each entry specifies the minimum Node version where the built-in is available.
 */
const NODE_BUILTIN_OVERLAPS: Array<{
  moduleName: string;
  replacement: string;
  minNodeVersion: string;
}> = [
  // fs improvements
  {
    moduleName: "mkdirp",
    replacement: "fs.mkdirSync(path, { recursive: true })",
    minNodeVersion: "10.12.0",
  },
  {
    moduleName: "rimraf",
    replacement: "fs.rmSync(path, { recursive: true, force: true })",
    minNodeVersion: "14.14.0",
  },
  {
    moduleName: "fs-extra",
    replacement: "Node fs with recursive options",
    minNodeVersion: "14.14.0",
  },
  {
    moduleName: "glob",
    replacement: "fs.globSync() or fs.glob()",
    minNodeVersion: "22.0.0",
  },
  {
    moduleName: "globby",
    replacement: "fs.glob() with patterns",
    minNodeVersion: "22.0.0",
  },
  {
    moduleName: "fast-glob",
    replacement: "fs.glob()",
    minNodeVersion: "22.0.0",
  },

  // fetch / http
  {
    moduleName: "node-fetch",
    replacement: "global fetch()",
    minNodeVersion: "18.0.0",
  },
  {
    moduleName: "cross-fetch",
    replacement: "global fetch()",
    minNodeVersion: "18.0.0",
  },
  {
    moduleName: "isomorphic-fetch",
    replacement: "global fetch()",
    minNodeVersion: "18.0.0",
  },
  {
    moduleName: "whatwg-fetch",
    replacement: "global fetch()",
    minNodeVersion: "18.0.0",
  },
  {
    moduleName: "unfetch",
    replacement: "global fetch()",
    minNodeVersion: "18.0.0",
  },
  {
    moduleName: "make-fetch-happen",
    replacement: "global fetch()",
    minNodeVersion: "18.0.0",
  },

  // test runner
  {
    moduleName: "tape",
    replacement: "node:test",
    minNodeVersion: "18.0.0",
  },

  // util
  {
    moduleName: "util.promisify",
    replacement: "node:util promisify()",
    minNodeVersion: "8.0.0",
  },
  {
    moduleName: "pify",
    replacement: "node:util promisify()",
    minNodeVersion: "8.0.0",
  },

  // path
  {
    moduleName: "path-is-absolute",
    replacement: "path.isAbsolute()",
    minNodeVersion: "0.12.0",
  },

  // assert
  {
    moduleName: "assert",
    replacement: "node:assert",
    minNodeVersion: "0.10.0",
  },

  // buffer
  {
    moduleName: "safe-buffer",
    replacement: "Buffer.alloc() / Buffer.from()",
    minNodeVersion: "6.0.0",
  },
  {
    moduleName: "buffer-from",
    replacement: "Buffer.from()",
    minNodeVersion: "6.0.0",
  },

  // structured clone
  {
    moduleName: "lodash.clonedeep",
    replacement: "structuredClone()",
    minNodeVersion: "17.0.0",
  },
  {
    moduleName: "clone-deep",
    replacement: "structuredClone()",
    minNodeVersion: "17.0.0",
  },
  {
    moduleName: "rfdc",
    replacement: "structuredClone()",
    minNodeVersion: "17.0.0",
  },

  // AbortController
  {
    moduleName: "abort-controller",
    replacement: "global AbortController",
    minNodeVersion: "15.0.0",
  },

  // URL / URLSearchParams
  {
    moduleName: "url-parse",
    replacement: "global URL",
    minNodeVersion: "10.0.0",
  },
  {
    moduleName: "whatwg-url",
    replacement: "global URL",
    minNodeVersion: "10.0.0",
  },
  {
    moduleName: "query-string",
    replacement: "URLSearchParams",
    minNodeVersion: "10.0.0",
  },

  // crypto
  {
    moduleName: "uuid",
    replacement: "crypto.randomUUID()",
    minNodeVersion: "19.0.0",
  },

  // parseArgs
  {
    moduleName: "minimist",
    replacement: "node:util parseArgs()",
    minNodeVersion: "18.3.0",
  },
  {
    moduleName: "yargs-parser",
    replacement: "node:util parseArgs()",
    minNodeVersion: "18.3.0",
  },
];

export async function getCandidates(): Promise<Candidate[]> {
  return NODE_BUILTIN_OVERLAPS.map((entry) => ({
    moduleName: entry.moduleName,
    source: "node-builtin" as const,
    replacementType: "native" as const,
    replacement: entry.replacement,
    minNodeVersion: entry.minNodeVersion,
  }));
}
