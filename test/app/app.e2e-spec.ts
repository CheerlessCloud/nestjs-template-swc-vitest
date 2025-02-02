import { describe, expect, it } from 'vitest';
import { createTestContext } from '../context.ts';
import { HealthCheck } from '../../src/app/HealthCheck.entity.ts';

describe('HealthCheckController', () => {
  const ctx = createTestContext({
    entryId: '',
  });

  it('returns "OK" for /health', async () => {
    const response = await ctx.agent.get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({
      id: expect.any(String),
      status: 'OK',
      createdAt: expect.any(String),
    });
    ctx.entryId = response.body.id;
  });

  it('creates a health check record in the database', async () => {
    const healthCheck = await ctx.getOrmRepository(HealthCheck).findOneOrFail({ id: ctx.entryId });

    expect(healthCheck).toBeDefined();
    expect(healthCheck.status).toBe('OK');
    expect(healthCheck.id).toBe(ctx.entryId);

    expect(healthCheck.createdAt).toBeInstanceOf(Date);
    expect(healthCheck.createdAt.valueOf()).toBeGreaterThan(Date.now() - 1000);
    expect(healthCheck.createdAt.valueOf()).toBeLessThan(Date.now());
  });
});
