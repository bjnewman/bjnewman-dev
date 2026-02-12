/**
 * Persistent cache for libraries.io data.
 *
 * Libraries.io dependent counts and top-repo lists change slowly — there's no
 * reason to re-fetch them every run. This module stores libraries.io results in
 * a JSON file and reuses them across runs.
 *
 * Cache invalidation:
 * 1. Time-based: entries older than MAX_AGE_DAYS are re-fetched
 * 2. npm-driven: after the enrich step, if a package's lastPublishDate has
 *    changed since the cache was written, the entry is marked stale for the
 *    next run
 *
 * Cache location: .cache/e18e/libraries-io.json (gitignored)
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { GraphData } from "./expand-graph.ts";

const MAX_AGE_DAYS = 7;
const MAX_AGE_MS = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

export interface CacheEntry {
  data: GraphData;
  cachedAt: string;
  lastPublishDate: string | null;
  stale?: boolean;
}

export interface CacheFile {
  version: 1;
  entries: Record<string, CacheEntry>;
}

export class LibrariesIoCache {
  private entries: Map<string, CacheEntry>;
  private filePath: string;
  private dirty = false;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.entries = new Map();
    this.load();
  }

  private load() {
    if (!existsSync(this.filePath)) return;

    try {
      const raw = readFileSync(this.filePath, "utf-8");
      const parsed = JSON.parse(raw) as CacheFile;
      if (parsed.version !== 1) return;

      for (const [key, entry] of Object.entries(parsed.entries)) {
        this.entries.set(key, entry);
      }
    } catch {
      // Corrupt cache — start fresh
    }
  }

  /**
   * Get cached graph data for a package, if still valid.
   * Returns null if not cached, expired, or explicitly marked stale.
   */
  get(packageName: string): GraphData | null {
    const entry = this.entries.get(packageName);
    if (!entry) return null;
    if (entry.stale) return null;

    const age = Date.now() - new Date(entry.cachedAt).getTime();
    if (age > MAX_AGE_MS) return null;

    return entry.data;
  }

  /**
   * Store graph data for a package.
   */
  set(packageName: string, data: GraphData, lastPublishDate?: string | null) {
    this.entries.set(packageName, {
      data,
      cachedAt: new Date().toISOString(),
      lastPublishDate: lastPublishDate ?? null,
    });
    this.dirty = true;
  }

  /**
   * After the enrich step completes, update cache entries with npm publish
   * dates. If a package's lastPublishDate has changed, mark the entry stale
   * so the next run re-fetches from libraries.io.
   */
  updatePublishDates(publishDates: Map<string, string | null>) {
    for (const [name, newDate] of publishDates) {
      const entry = this.entries.get(name);
      if (!entry) continue;

      if (entry.lastPublishDate && newDate && entry.lastPublishDate !== newDate) {
        entry.stale = true;
        this.dirty = true;
      } else if (!entry.lastPublishDate && newDate) {
        entry.lastPublishDate = newDate;
        this.dirty = true;
      }
    }
  }

  /** Number of cached entries. */
  get size(): number {
    return this.entries.size;
  }

  /** Number of valid (non-stale, non-expired) entries. */
  get validCount(): number {
    let count = 0;
    for (const entry of this.entries.values()) {
      if (entry.stale) continue;
      const age = Date.now() - new Date(entry.cachedAt).getTime();
      if (age <= MAX_AGE_MS) count++;
    }
    return count;
  }

  /** Persist cache to disk. */
  save() {
    if (!this.dirty && this.entries.size === 0) return;

    const cacheFile: CacheFile = {
      version: 1,
      entries: Object.fromEntries(this.entries),
    };

    mkdirSync(dirname(this.filePath), { recursive: true });
    writeFileSync(this.filePath, JSON.stringify(cacheFile));
  }
}
