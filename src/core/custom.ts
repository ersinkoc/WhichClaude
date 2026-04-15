import type { CustomProvider, WhichCCConfig } from '../types.js';
import { RESERVED_PROVIDER_IDS } from '../constants.js';
import { removeKey } from './keys.js';

export function generateProviderId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isReservedId(id: string): boolean {
  return (RESERVED_PROVIDER_IDS as readonly string[]).includes(id);
}

export function validateCustomProviderInput(input: {
  name: string;
  baseUrl: string;
  models: readonly string[];
  defaultModel: string;
}): { ok: true; id: string } | { ok: false; error: string } {
  if (!input.name || input.name.trim().length === 0) {
    return { ok: false, error: 'Provider name is required' };
  }
  const id = generateProviderId(input.name);
  if (!id) {
    return { ok: false, error: 'Provider name produces empty ID' };
  }
  if (isReservedId(id)) {
    return {
      ok: false,
      error: `Provider ID "${id}" is reserved for built-in provider`,
    };
  }
  if (!/^https?:\/\//.test(input.baseUrl)) {
    return { ok: false, error: 'Base URL must start with http:// or https://' };
  }
  if (!input.models || input.models.length === 0) {
    return { ok: false, error: 'At least one model is required' };
  }
  if (!input.models.includes(input.defaultModel)) {
    return { ok: false, error: 'Default model must be in models list' };
  }
  return { ok: true, id };
}

export function addCustomProvider(
  config: WhichCCConfig,
  id: string,
  provider: CustomProvider,
): WhichCCConfig {
  config.customProviders[id] = provider;
  return config;
}

export function removeCustomProvider(
  config: WhichCCConfig,
  id: string,
): { config: WhichCCConfig; removed: boolean } {
  if (!(id in config.customProviders)) {
    return { config, removed: false };
  }
  delete config.customProviders[id];
  try {
    removeKey(id);
  } catch {
    // key may not exist — ignore
  }
  return { config, removed: true };
}

export function updateCustomProvider(
  config: WhichCCConfig,
  id: string,
  patch: Partial<CustomProvider>,
): WhichCCConfig {
  const existing = config.customProviders[id];
  if (!existing) return config;
  config.customProviders[id] = { ...existing, ...patch };
  return config;
}

export function addModelToCustomProvider(
  config: WhichCCConfig,
  id: string,
  model: string,
  setAsDefault: boolean,
): WhichCCConfig {
  const existing = config.customProviders[id];
  if (!existing) return config;
  const models = existing.models.includes(model)
    ? [...existing.models]
    : [...existing.models, model];
  config.customProviders[id] = {
    ...existing,
    models,
    defaultModel: setAsDefault ? model : existing.defaultModel,
  };
  return config;
}

export function removeModelFromCustomProvider(
  config: WhichCCConfig,
  id: string,
  model: string,
): { config: WhichCCConfig; removed: boolean } {
  const existing = config.customProviders[id];
  if (!existing) return { config, removed: false };
  if (!existing.models.includes(model)) return { config, removed: false };
  const models = existing.models.filter((m) => m !== model);
  if (models.length === 0) {
    return { config, removed: false };
  }
  const defaultModel =
    existing.defaultModel === model ? (models[0] ?? existing.defaultModel) : existing.defaultModel;
  config.customProviders[id] = { ...existing, models, defaultModel };
  return { config, removed: true };
}
