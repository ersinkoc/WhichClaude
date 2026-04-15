import { describe, it, expect } from 'vitest';
import {
  getDefaultConfig,
  migrateConfig,
  addUserModel,
  removeUserModel,
  setLastUsed,
} from '../src/core/config.js';

describe('getDefaultConfig', () => {
  it('produces a valid config with all 4 built-in providers', () => {
    const cfg = getDefaultConfig();
    expect(cfg.version).toBe(1);
    expect(cfg.providers['zai']).toBeDefined();
    expect(cfg.providers['kimi']).toBeDefined();
    expect(cfg.providers['minimax']).toBeDefined();
    expect(cfg.providers['alibaba']).toBeDefined();
    expect(Object.keys(cfg.customProviders).length).toBe(0);
    expect(cfg.defaults.statusLine).toBe(true);
  });
});

describe('migrateConfig', () => {
  it('returns defaults for non-object', () => {
    const cfg = migrateConfig(null);
    expect(cfg.version).toBe(1);
  });

  it('preserves custom providers and defaults', () => {
    const input = {
      version: 1,
      defaults: { skipDangerous: true, statusLine: false, statusLineCommand: 'x' },
      providers: { zai: { defaultModel: 'glm-5', userModels: ['foo'] } },
      customProviders: {
        deepseek: {
          name: 'DeepSeek',
          baseUrl: 'https://x',
          models: ['r3'],
          defaultModel: 'r3',
          addedAt: 'now',
        },
      },
    };
    const cfg = migrateConfig(input);
    expect(cfg.defaults.skipDangerous).toBe(true);
    expect(cfg.defaults.statusLine).toBe(false);
    expect(cfg.providers['zai']?.userModels).toEqual(['foo']);
    expect(cfg.customProviders['deepseek']?.name).toBe('DeepSeek');
  });
});

describe('addUserModel / removeUserModel', () => {
  it('adds a user model and sets default', () => {
    const cfg = getDefaultConfig();
    addUserModel(cfg, 'zai', 'glm-6', true);
    expect(cfg.providers['zai']?.userModels).toContain('glm-6');
    expect(cfg.providers['zai']?.defaultModel).toBe('glm-6');
  });

  it('removes a user model and falls back to built-in default', () => {
    const cfg = getDefaultConfig();
    addUserModel(cfg, 'zai', 'glm-6', true);
    const { removed } = removeUserModel(cfg, 'zai', 'glm-6');
    expect(removed).toBe(true);
    expect(cfg.providers['zai']?.userModels).not.toContain('glm-6');
    expect(cfg.providers['zai']?.defaultModel).toBe('glm-5.1');
  });

  it('refuses to remove a non-user model', () => {
    const cfg = getDefaultConfig();
    const { removed } = removeUserModel(cfg, 'zai', 'glm-5.1');
    expect(removed).toBe(false);
  });
});

describe('setLastUsed', () => {
  it('records last used with timestamp', () => {
    const cfg = getDefaultConfig();
    setLastUsed(cfg, 'zai', 'glm-5.1');
    expect(cfg.lastUsed?.provider).toBe('zai');
    expect(cfg.lastUsed?.model).toBe('glm-5.1');
    expect(cfg.lastUsed?.timestamp).toBeDefined();
  });
});
