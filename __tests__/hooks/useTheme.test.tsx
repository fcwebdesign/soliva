import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '@/hooks/useTheme';

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('defaults to light and toggles to dark', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');

    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('changeTheme applies explicit theme', () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.changeTheme('dark'));
    expect(result.current.theme).toBe('dark');
    act(() => result.current.changeTheme('light'));
    expect(result.current.theme).toBe('light');
  });
});

