import { describe, it, expect } from 'vitest';
import { parseArgs, ParseError } from '../src/cli/parser.js';

describe('parseArgs', () => {
  it('parses basic provider + model + skipDangerous', () => {
    const r = parseArgs(['-p', 'zai', '-m', 'glm-5.1', '-sd']);
    expect(r.provider).toBe('zai');
    expect(r.model).toBe('glm-5.1');
    expect(r.skipDangerous).toBe(true);
  });

  it('parses long-form flags', () => {
    const r = parseArgs(['--provider', 'kimi', '--apikey', 'sk-abc', '--statusline']);
    expect(r.provider).toBe('kimi');
    expect(r.apikey).toBe('sk-abc');
    expect(r.statusLine).toBe(true);
  });

  it('parses add-custom with flags', () => {
    const r = parseArgs([
      '--add-custom',
      '--name',
      'DeepSeek',
      '--url',
      'https://api.deepseek.com/anthropic',
      '-a',
      'sk-xxx',
      '-m',
      'deepseek-r3',
    ]);
    expect(r.addCustom).toBe(true);
    expect(r.name).toBe('DeepSeek');
    expect(r.url).toBe('https://api.deepseek.com/anthropic');
    expect(r.apikey).toBe('sk-xxx');
    expect(r.model).toBe('deepseek-r3');
  });

  it('parses add-model with set-default', () => {
    const r = parseArgs(['-p', 'zai', '--add-model', 'glm-6', '--set-default']);
    expect(r.provider).toBe('zai');
    expect(r.addModel).toBe('glm-6');
    expect(r.setDefault).toBe(true);
  });

  it('throws on unknown flag', () => {
    expect(() => parseArgs(['--nonsense'])).toThrow(ParseError);
  });

  it('throws when string flag missing value', () => {
    expect(() => parseArgs(['-p'])).toThrow(ParseError);
  });

  it('defaults are false for unset flags', () => {
    const r = parseArgs([]);
    expect(r.update).toBe(false);
    expect(r.help).toBe(false);
    expect(r.version).toBe(false);
    expect(r.clean).toBe(false);
  });

  it('parses version and help aliases', () => {
    expect(parseArgs(['-v']).version).toBe(true);
    expect(parseArgs(['--version']).version).toBe(true);
    expect(parseArgs(['-h']).help).toBe(true);
    expect(parseArgs(['--help']).help).toBe(true);
  });

  it('parses no-launch and dry-run', () => {
    const r = parseArgs(['--no-launch', '--dry-run']);
    expect(r.noLaunch).toBe(true);
    expect(r.dryRun).toBe(true);
  });

  it('parses remove flags', () => {
    const r = parseArgs(['-p', 'zai', '--remove-key']);
    expect(r.removeKey).toBe(true);
    const r2 = parseArgs(['--remove-custom', 'deepseek']);
    expect(r2.removeCustom).toBe('deepseek');
    const r3 = parseArgs(['-p', 'zai', '--remove-model', 'glm-6']);
    expect(r3.removeModel).toBe('glm-6');
  });
});
