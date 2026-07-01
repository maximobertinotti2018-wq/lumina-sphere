// Simple in-memory sliding window rate limiter
// For production with multiple instances, use Redis

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitInfo>();

// Cada cuántas llamadas barremos las entradas vencidas. Sin esto, el Map
// crece sin límite (una entrada por cada identificador visto) → fuga de memoria.
const CLEANUP_EVERY = 500;
let callsSinceCleanup = 0;

function purgeExpired(now: number): void {
  for (const [key, info] of store) {
    if (now > info.resetTime) store.delete(key);
  }
}

export async function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<{ success: boolean; retryAfter?: number }> {
  const now = Date.now();

  if (++callsSinceCleanup >= CLEANUP_EVERY) {
    callsSinceCleanup = 0;
    purgeExpired(now);
  }

  const record = store.get(identifier);

  if (!record || now > record.resetTime) {
    store.set(identifier, { count: 1, resetTime: now + windowMs });
    return { success: true };
  }

  if (record.count >= limit) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { success: false, retryAfter };
  }

  record.count += 1;
  store.set(identifier, record);
  return { success: true };
}
