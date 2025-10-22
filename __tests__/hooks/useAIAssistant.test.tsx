import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAIAssistant } from '@/app/admin/components/hooks/useAIAssistant';

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

describe('useAIAssistant', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getDescriptionSuggestion calls API and updates field', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ suggestedDescription: 'Texte IA' }),
    });
    vi.stubGlobal('fetch', fetchMock as any);

    const updateField = vi.fn();
    const { result } = renderHook(() =>
      useAIAssistant({
        pageKey: 'contact',
        localData: { hero: { title: 'Contact' } },
        blocks: [],
        updateField,
        updateBlock: vi.fn(),
      })
    );

    await act(async () => {
      await result.current.getDescriptionSuggestion();
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/admin/ai/suggest-description', expect.any(Object));
    expect(updateField).toHaveBeenCalledWith('description', 'Texte IA');
  });

  it('getBlockContentSuggestion updates services offerings when present', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ suggestedContent: { offerings: [{ description: 'A' }, { description: 'B' }] } }),
    });
    vi.stubGlobal('fetch', fetchMock as any);

    const updateBlock = vi.fn();
    const blocks = [
      { id: 'b1', type: 'services', offerings: [{ title: 'S1' }, { title: 'S2' }] },
    ];

    const { result } = renderHook(() =>
      useAIAssistant({
        pageKey: 'home',
        localData: {},
        blocks,
        updateField: vi.fn(),
        updateBlock,
      })
    );

    await act(async () => {
      await result.current.getBlockContentSuggestion('b1', 'services');
    });

    expect(updateBlock).toHaveBeenCalledWith('b1', {
      offerings: [
        { title: 'S1', description: 'A' },
        { title: 'S2', description: 'B' },
      ],
    });
  });
});

