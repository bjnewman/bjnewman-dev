import type { Candidate } from "../types.ts";

/**
 * Polyfills whose reason to exist has expired.
 * These fill gaps in JavaScript engines that all current LTS Node versions
 * and modern browsers (Baseline) now support natively.
 */
const EXPIRED_POLYFILLS: Array<{
  moduleName: string;
  replacement: string;
  minNodeVersion: string;
}> = [
  // Array methods (ES2015-2016)
  { moduleName: "array-includes", replacement: "Array.prototype.includes()", minNodeVersion: "6.0.0" },
  { moduleName: "array.prototype.includes", replacement: "Array.prototype.includes()", minNodeVersion: "6.0.0" },
  { moduleName: "array-find", replacement: "Array.prototype.find()", minNodeVersion: "4.0.0" },
  { moduleName: "array.prototype.find", replacement: "Array.prototype.find()", minNodeVersion: "4.0.0" },
  { moduleName: "array.prototype.findindex", replacement: "Array.prototype.findIndex()", minNodeVersion: "4.0.0" },
  { moduleName: "array.from", replacement: "Array.from()", minNodeVersion: "4.0.0" },
  { moduleName: "array.prototype.flat", replacement: "Array.prototype.flat()", minNodeVersion: "11.0.0" },
  { moduleName: "array.prototype.flatmap", replacement: "Array.prototype.flatMap()", minNodeVersion: "11.0.0" },
  { moduleName: "array-every", replacement: "Array.prototype.every()", minNodeVersion: "0.10.0" },
  { moduleName: "array-map", replacement: "Array.prototype.map()", minNodeVersion: "0.10.0" },
  { moduleName: "array-foreach", replacement: "Array.prototype.forEach()", minNodeVersion: "0.10.0" },
  { moduleName: "array-filter", replacement: "Array.prototype.filter()", minNodeVersion: "0.10.0" },
  { moduleName: "array-reduce", replacement: "Array.prototype.reduce()", minNodeVersion: "0.10.0" },
  { moduleName: "isarray", replacement: "Array.isArray()", minNodeVersion: "0.10.0" },

  // Object methods
  { moduleName: "object-assign", replacement: "Object.assign()", minNodeVersion: "4.0.0" },
  { moduleName: "object.assign", replacement: "Object.assign()", minNodeVersion: "4.0.0" },
  { moduleName: "object-keys", replacement: "Object.keys()", minNodeVersion: "0.10.0" },
  { moduleName: "object.entries", replacement: "Object.entries()", minNodeVersion: "8.0.0" },
  { moduleName: "object.values", replacement: "Object.values()", minNodeVersion: "8.0.0" },
  { moduleName: "object.fromentries", replacement: "Object.fromEntries()", minNodeVersion: "12.0.0" },
  { moduleName: "has", replacement: "Object.hasOwn()", minNodeVersion: "16.9.0" },
  { moduleName: "hasown", replacement: "Object.hasOwn()", minNodeVersion: "16.9.0" },

  // String methods
  { moduleName: "string.prototype.trim", replacement: "String.prototype.trim()", minNodeVersion: "0.10.0" },
  { moduleName: "string.prototype.trimstart", replacement: "String.prototype.trimStart()", minNodeVersion: "10.0.0" },
  { moduleName: "string.prototype.trimend", replacement: "String.prototype.trimEnd()", minNodeVersion: "10.0.0" },
  { moduleName: "string.prototype.padstart", replacement: "String.prototype.padStart()", minNodeVersion: "8.0.0" },
  { moduleName: "string.prototype.padend", replacement: "String.prototype.padEnd()", minNodeVersion: "8.0.0" },
  { moduleName: "string.prototype.startswith", replacement: "String.prototype.startsWith()", minNodeVersion: "4.0.0" },
  { moduleName: "string.prototype.endswith", replacement: "String.prototype.endsWith()", minNodeVersion: "4.0.0" },
  { moduleName: "string.prototype.repeat", replacement: "String.prototype.repeat()", minNodeVersion: "4.0.0" },
  { moduleName: "string.prototype.replaceall", replacement: "String.prototype.replaceAll()", minNodeVersion: "15.0.0" },
  { moduleName: "string.prototype.matchall", replacement: "String.prototype.matchAll()", minNodeVersion: "12.0.0" },
  { moduleName: "string.prototype.at", replacement: "String.prototype.at()", minNodeVersion: "16.6.0" },

  // Promise
  { moduleName: "es6-promise", replacement: "native Promise", minNodeVersion: "4.0.0" },
  { moduleName: "promise-polyfill", replacement: "native Promise", minNodeVersion: "4.0.0" },
  { moduleName: "promise.allsettled", replacement: "Promise.allSettled()", minNodeVersion: "12.9.0" },
  { moduleName: "promise.any", replacement: "Promise.any()", minNodeVersion: "15.0.0" },

  // Symbol / Iterator
  { moduleName: "es6-symbol", replacement: "native Symbol", minNodeVersion: "4.0.0" },
  { moduleName: "es6-iterator", replacement: "native iterators", minNodeVersion: "4.0.0" },

  // Map / Set / WeakMap
  { moduleName: "es6-map", replacement: "native Map", minNodeVersion: "4.0.0" },
  { moduleName: "es6-set", replacement: "native Set", minNodeVersion: "4.0.0" },
  { moduleName: "es6-weak-map", replacement: "native WeakMap", minNodeVersion: "4.0.0" },

  // Number / Math
  { moduleName: "is-nan", replacement: "Number.isNaN()", minNodeVersion: "0.10.0" },
  { moduleName: "number-is-nan", replacement: "Number.isNaN()", minNodeVersion: "0.10.0" },
  { moduleName: "is-finite", replacement: "Number.isFinite()", minNodeVersion: "0.10.0" },
  { moduleName: "number.isinteger", replacement: "Number.isInteger()", minNodeVersion: "0.12.0" },
  { moduleName: "math.sign", replacement: "Math.sign()", minNodeVersion: "0.12.0" },

  // Type checking primitives
  { moduleName: "is-number", replacement: "typeof x === 'number'", minNodeVersion: "0.10.0" },
  { moduleName: "is-string", replacement: "typeof x === 'string'", minNodeVersion: "0.10.0" },
  { moduleName: "is-boolean-object", replacement: "typeof x === 'boolean'", minNodeVersion: "0.10.0" },
  { moduleName: "is-symbol", replacement: "typeof x === 'symbol'", minNodeVersion: "4.0.0" },
  { moduleName: "is-plain-object", replacement: "manual check or structuredClone", minNodeVersion: "0.10.0" },
  { moduleName: "is-plain-obj", replacement: "manual check", minNodeVersion: "0.10.0" },
  { moduleName: "is-regexp", replacement: "x instanceof RegExp", minNodeVersion: "0.10.0" },
  { moduleName: "is-date-object", replacement: "x instanceof Date", minNodeVersion: "0.10.0" },
  { moduleName: "is-arguments", replacement: "Array.isArray() or spread", minNodeVersion: "0.10.0" },

  // Misc built-ins that have been around forever
  { moduleName: "array-buffer-byte-length", replacement: "ArrayBuffer.prototype.byteLength", minNodeVersion: "0.10.0" },
  { moduleName: "arraybuffer.prototype.slice", replacement: "ArrayBuffer.prototype.slice()", minNodeVersion: "0.10.0" },
  { moduleName: "define-properties", replacement: "Object.defineProperties()", minNodeVersion: "0.10.0" },
  { moduleName: "globalthis", replacement: "globalThis", minNodeVersion: "12.0.0" },
  { moduleName: "json-stable-stringify", replacement: "JSON.stringify() with sorted keys", minNodeVersion: "0.10.0" },
];

export async function getCandidates(): Promise<Candidate[]> {
  return EXPIRED_POLYFILLS.map((entry) => ({
    moduleName: entry.moduleName,
    source: "polyfill-decay" as const,
    replacementType: "native" as const,
    replacement: entry.replacement,
    minNodeVersion: entry.minNodeVersion,
  }));
}
