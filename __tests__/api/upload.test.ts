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

const importRoute = async () => await import('@/app/api/admin/upload/route');

describe('API /api/admin/upload', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when no file provided', async () => {
    const { POST } = await importRoute();
    const req: any = { formData: async () => ({ get: () => null }) };
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data).toHaveProperty('error');
  });

  it('rejects invalid extension', async () => {
    const { POST } = await importRoute();
    const fakeFile = {
      name: 'malicious.exe',
      size: 10,
      type: 'application/octet-stream',
      arrayBuffer: async () => new ArrayBuffer(0),
    } as any;
    const req: any = { formData: async () => ({ get: () => fakeFile }) };
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Extension/);
  });
});

