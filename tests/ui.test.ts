import { describe, it, expect } from 'vitest';
import { maskKey, c, visibleLength } from '../src/cli/ui.js';

describe('maskKey', () => {
  it('masks short keys fully', () => {
    expect(maskKey('abc')).toBe('•••');
  });
  it('masks long keys preserving first/last 4', () => {
    const m = maskKey('sk-proj-abcdefghij');
    expect(m.startsWith('sk-p')).toBe(true);
    expect(m.endsWith('fghij'.slice(-4))).toBe(true);
    expect(m.includes('•')).toBe(true);
  });
});

describe('color helpers', () => {
  it('wraps with ansi codes', () => {
    expect(c.green('ok')).toContain('ok');
    expect(c.green('ok')).toContain('\x1b[');
  });
});

describe('visibleLength', () => {
  it('strips ansi', () => {
    expect(visibleLength('\x1b[31mhello\x1b[0m')).toBe(5);
  });
});
