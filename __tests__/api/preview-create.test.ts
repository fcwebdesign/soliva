/* @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node:fs', async (orig) => {
  const mod: any = await (orig as any)();
  return {
    ...mod,
    promises: {
      ...mod.promises,
      mkdir: vi.fn().mockResolvedValue(undefined),
      writeFile: vi.fn().mockResolvedValue(undefined),
    },
  };
});

const importRoute = async () => await import('@/app/api/admin/preview/create/route');

describe('API /api/admin/preview/create', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when previewId or content missing', async () => {
    const { POST } = await importRoute();
    const res = await POST({ json: async () => ({}) } as any);
    expect(res.status).toBe(400);
  });

  it('writes preview file and returns success', async () => {
    const { POST } = await importRoute();
    const req: any = { json: async () => ({ previewId: 'p1', content: { ok: true }, page: 'home' }) };
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toMatchObject({ success: true, previewId: 'p1' });
  });
});

