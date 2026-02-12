/**
 * Rate limiter that allows concurrent requests while respecting rate limits.
 * Uses a token bucket: requests acquire a token before firing, tokens
 * are replenished at the configured rate.
 */
export function createRateLimiter(requestsPerMinute: number) {
  const minDelayMs = Math.ceil(60_000 / requestsPerMinute);
  let nextAvailableSlot = 0;

  return async function rateLimitedFetch(
    url: string,
    init?: RequestInit,
  ): Promise<Response> {
    // Reserve the next available time slot
    const now = Date.now();
    const mySlot = Math.max(now, nextAvailableSlot);
    nextAvailableSlot = mySlot + minDelayMs;

    // Wait until our slot
    const waitTime = mySlot - now;
    if (waitTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    const response = await fetch(url, init);

    // If rate limited, wait and retry once
    if (response.status === 429) {
      const retryAfter = response.headers.get("retry-after");
      const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 60_000;
      console.warn(`  Rate limited, waiting ${waitMs / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      // Push future slots out
      nextAvailableSlot = Date.now() + minDelayMs;
      return fetch(url, init);
    }

    return response;
  };
}

/**
 * Run async tasks with bounded concurrency.
 */
export async function parallelMap<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const i = nextIndex++;
      results[i] = await fn(items[i], i);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}
