/**
 * Manual effort classification for "documented" replacement types.
 *
 * Each docPath maps to an effort multiplier (0.20 = very hard, 1.0 = trivial).
 * The multiplier represents how easy it is for a contributor to open a PR
 * removing this dependency from a typical consumer.
 *
 * Factors: number of call sites, API surface area, how deeply embedded.
 */
export const EFFORT_TIERS: Record<string, number> = {
  // Trivial — single function, drop-in replacement
  "buf-compare": 0.95,
  "buffer-equal": 0.95,
  "buffer-equals": 0.95,
  "builtin-modules": 0.90,
  "is-builtin-module": 0.90,
  "mkdirp": 0.90,
  "rimraf": 0.90,
  "path-exists": 0.90,
  "find-up": 0.85,
  "find-file-up": 0.85,
  "find-pkg": 0.85,
  "find-cache-dir": 0.85,
  "find-cache-directory": 0.85,
  "pkg-dir": 0.85,
  "read-pkg": 0.85,
  "read-pkg-up": 0.85,
  "read-package-up": 0.85,
  "md5": 0.85,
  "shortid": 0.85,
  "body-parser": 0.85,
  "core-util-is": 0.90,
  "invariant": 0.90,
  "tempy": 0.85,
  "utf8": 0.90,
  "sort-object": 0.90,
  "dot-prop": 0.85,
  "uri-js": 0.85,
  "emoji-regex": 0.90,
  "grapheme": 0.85,
  "graphemer": 0.85,
  "strip-ansi": 0.85,
  "string-width": 0.80,
  "object-hash": 0.80,

  // Moderate — a few call sites, clear migration path
  "chalk": 0.70,
  "glob": 0.75,
  "globby": 0.70,
  "fast-glob": 0.70,
  "fetch": 0.65,
  "ez-spawn": 0.75,
  "process-exec": 0.75,
  "execa": 0.60,
  "dotenv": 0.75,
  "js-yaml": 0.70,
  "qs": 0.75,
  "ora": 0.70,
  "deep-equal": 0.75,
  "depcheck": 0.65,
  "cpx": 0.75,
  "npm-run-all": 0.70,
  "lint-staged": 0.65,
  "readable-stream": 0.60,
  "traverse": 0.65,
  "xmldom": 0.70,
  "crypto-js": 0.60,
  "faker": 0.55,

  // Hard — pervasive usage, many call sites, complex migration
  "fs-extra": 0.45,
  "lodash-underscore": 0.30,
  "bluebird-q": 0.25,
  "moment": 0.20,
  "jquery": 0.20,
  "materialize-css": 0.25,
  "portal-vue": 0.35,

  // ESLint plugins — moderate, config-level change
  "eslint-plugin-es": 0.70,
  "eslint-plugin-eslint-comments": 0.70,
  "eslint-plugin-import": 0.55,
  "eslint-plugin-node": 0.65,
  "eslint-plugin-react": 0.55,
  "eslint-plugin-vitest": 0.70,
  "jsx-ast-utils": 0.65,
};

/** Default effort for documented types with unknown docPath */
export const DEFAULT_EFFORT = 0.50;
