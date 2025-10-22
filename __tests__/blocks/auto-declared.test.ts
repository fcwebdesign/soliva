import '@/blocks/auto-declared';
import { describe, it, expect } from 'vitest';
import { getAvailableBlockTypes, getAutoDeclaredBlock, createAutoBlockInstance } from '@/blocks/auto-declared/registry';

describe('Auto-declared blocks registry', () => {
  it('registers known block types', () => {
    const types = getAvailableBlockTypes();
    expect(types).toContain('content');
    expect(types).toContain('expandable-card');
    expect(types).toContain('h2');
  });

  it('can create default instances', () => {
    const content = createAutoBlockInstance('content');
    expect(content).toHaveProperty('id');
    expect(content).toMatchObject({ type: 'content', data: { content: '' } });

    const expandable = createAutoBlockInstance('expandable-card');
    expect(expandable).toMatchObject({ type: 'expandable-card', data: { cards: [] } });
  });

  it('exposes component and editor for blocks', () => {
    const mod = getAutoDeclaredBlock('expandable-card');
    expect(mod?.component).toBeDefined();
    expect(mod?.editor).toBeDefined();
  });
});

