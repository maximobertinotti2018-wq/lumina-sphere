import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { rateLimit } from './rateLimit';

describe('rateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('permite hasta el límite dentro de la ventana', async () => {
    const id = `test-limit-${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      const res = await rateLimit(id, 3, 60_000);
      expect(res.success).toBe(true);
    }
  });

  it('bloquea la request que supera el límite e informa retryAfter', async () => {
    const id = `test-block-${Date.now()}`;
    for (let i = 0; i < 3; i++) await rateLimit(id, 3, 60_000);

    const blocked = await rateLimit(id, 3, 60_000);
    expect(blocked.success).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
    expect(blocked.retryAfter).toBeLessThanOrEqual(60);
  });

  it('resetea el contador cuando expira la ventana', async () => {
    const id = `test-reset-${Date.now()}`;
    for (let i = 0; i < 3; i++) await rateLimit(id, 3, 60_000);
    expect((await rateLimit(id, 3, 60_000)).success).toBe(false);

    // Avanzamos el reloj más allá de la ventana.
    vi.advanceTimersByTime(61_000);

    expect((await rateLimit(id, 3, 60_000)).success).toBe(true);
  });

  it('identificadores distintos no comparten contador', async () => {
    const a = `test-a-${Date.now()}`;
    const b = `test-b-${Date.now()}`;
    for (let i = 0; i < 3; i++) await rateLimit(a, 3, 60_000);

    expect((await rateLimit(a, 3, 60_000)).success).toBe(false);
    expect((await rateLimit(b, 3, 60_000)).success).toBe(true);
  });
});
