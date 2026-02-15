/**
 * Simple JSON file cache for BigQuery dependency data.
 *
 * BigQuery snapshots update infrequently, so a 7-day TTL is appropriate.
 * Cache location: .cache/e18e/bigquery-dependents.json (gitignored)
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const MAX_AGE_DAYS = 7;
const MAX_AGE_MS = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

export interface BigQueryCacheFile {
  version: 1;
  snapshotDate: string;
  fetchedAt: string;
  data: Record<string, string[]>;
}

export class BigQueryCache {
  private filePath: string;
  private cache: BigQueryCacheFile | null = null;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.load();
  }

  private load() {
    if (!existsSync(this.filePath)) return;

    try {
      const raw = readFileSync(this.filePath, "utf-8");
      const parsed = JSON.parse(raw) as BigQueryCacheFile;
      if (parsed.version !== 1) return;
      this.cache = parsed;
    } catch {
      // Corrupt cache — start fresh
    }
  }

  /**
   * Get all cached data, or null if cache is expired/missing.
   */
  getAll(): Record<string, string[]> | null {
    if (!this.cache) return null;

    const age = Date.now() - new Date(this.cache.fetchedAt).getTime();
    if (age > MAX_AGE_MS) return null;

    return this.cache.data;
  }

  /**
   * Get the fetchedAt timestamp, or null if no cache.
   */
  getFetchedAt(): string | null {
    return this.cache?.fetchedAt ?? null;
  }

  /**
   * Save new data to cache.
   */
  save(snapshotDate: string, data: Record<string, string[]>) {
    const cacheFile: BigQueryCacheFile = {
      version: 1,
      snapshotDate,
      fetchedAt: new Date().toISOString(),
      data,
    };

    mkdirSync(dirname(this.filePath), { recursive: true });
    writeFileSync(this.filePath, JSON.stringify(cacheFile));
    this.cache = cacheFile;
  }
}
