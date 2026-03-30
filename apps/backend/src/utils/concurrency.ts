export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const concurrency = Math.max(1, Math.min(limit, items.length || 1));
  const results = new Array<R>(items.length);
  let cursor = 0;

  const runners = Array.from({ length: concurrency }, async () => {
    while (true) {
      const current = cursor;
      cursor += 1;

      if (current >= items.length) {
        return;
      }

      const item = items[current];
      if (item === undefined) {
        return;
      }

      results[current] = await worker(item, current);
    }
  });

  await Promise.all(runners);
  return results;
}
