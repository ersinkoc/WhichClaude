import { describe, it, expect } from 'vitest';
import { buildSessionSettings } from '../src/core/session.js';

describe('buildSessionSettings', () => {
  it('sets all 5 model env vars to the same value', () => {
    const s = buildSessionSettings('https://api.z.ai/api/anthropic', 'sk-xxx', 'glm-5.1', {
      statusLine: false,
      statusLineCommand: 'x',
    });
    expect(s.env.ANTHROPIC_MODEL).toBe('glm-5.1');
    expect(s.env.ANTHROPIC_SMALL_FAST_MODEL).toBe('glm-5.1');
    expect(s.env.ANTHROPIC_DEFAULT_HAIKU_MODEL).toBe('glm-5.1');
    expect(s.env.ANTHROPIC_DEFAULT_SONNET_MODEL).toBe('glm-5.1');
    expect(s.env.ANTHROPIC_DEFAULT_OPUS_MODEL).toBe('glm-5.1');
    expect(s.env.ANTHROPIC_AUTH_TOKEN).toBe('sk-xxx');
    expect(s.env.ANTHROPIC_BASE_URL).toBe('https://api.z.ai/api/anthropic');
    expect(s.env.CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC).toBe(1);
  });

  it('omits statusLine when disabled', () => {
    const s = buildSessionSettings('url', 'key', 'model', {
      statusLine: false,
      statusLineCommand: 'x',
    });
    expect(s.statusLine).toBeUndefined();
  });

  it('includes statusLine when enabled', () => {
    const s = buildSessionSettings('url', 'key', 'model', {
      statusLine: true,
      statusLineCommand: 'npx -y ccstatusline@latest',
    });
    expect(s.statusLine).toEqual({
      type: 'command',
      command: 'npx -y ccstatusline@latest',
      padding: 0,
    });
  });
});
