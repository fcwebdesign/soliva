import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/content', () => {
  return {
    readContent: vi.fn(),
    writeContent: vi.fn(),
  };
});

// Use dynamic import to ensure mocks are applied
const importRoute = async () => await import('@/app/api/admin/content/route');
const { readContent, writeContent } = await import('@/lib/content');

describe('API /api/admin/content', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET returns content JSON (200)', async () => {
    (readContent as any).mockResolvedValue({ ok: true, nav: { items: ['home'] } });
    const { GET } = await importRoute();
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toMatchObject({ ok: true, nav: { items: ['home'] } });
  });

  it('PUT validates and writes content (200)', async () => {
    const { PUT } = await importRoute();
    (writeContent as any).mockResolvedValue(undefined);
    (readContent as any).mockResolvedValue({ saved: true });

    const request: any = {
      json: async () => ({ content: { nav: { items: ['home'] } } }),
    };

    const res = await PUT(request);
    expect(writeContent).toHaveBeenCalled();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toMatchObject({ saved: true });
  });

  it('PUT without content returns 400', async () => {
    const { PUT } = await importRoute();
    const request: any = { json: async () => ({}) };
    const res = await PUT(request);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data).toHaveProperty('error');
  });
});
/* @vitest-environment node */
