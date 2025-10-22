import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/content', () => ({
  listVersions: vi.fn(),
  revertTo: vi.fn(),
  readContent: vi.fn(),
}));

const importRoute = async () => await import('@/app/api/admin/versions/route');
const { listVersions, revertTo, readContent } = await import('@/lib/content');

describe('API /api/admin/versions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('GET returns versions (200)', async () => {
    (listVersions as any).mockResolvedValue([
      { filename: 'content-1.json', createdAt: '2025-01-01T00:00:00Z' }
    ]);
    const { GET } = await importRoute();
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toHaveProperty('filename');
  });

  it('POST without filename returns 400', async () => {
    const { POST } = await importRoute();
    const res = await POST({ json: async () => ({}) } as any);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data).toHaveProperty('error');
  });

  it('POST with filename triggers revert and returns content', async () => {
    const { POST } = await importRoute();
    (readContent as any).mockResolvedValue({ ok: true });
    const res = await POST({ json: async () => ({ filename: 'content-1.json' }) } as any);
    expect(revertTo).toHaveBeenCalledWith('content-1.json');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toMatchObject({ ok: true });
  });
});
/* @vitest-environment node */
