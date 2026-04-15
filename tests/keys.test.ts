import { describe, it, expect } from 'vitest';
import { encryptKey, decryptKey } from '../src/core/keys.js';
import { ENCRYPTION_PREFIX } from '../src/constants.js';

describe('encryptKey / decryptKey', () => {
  it('round-trips a plaintext', () => {
    const plaintext = 'sk-proj-abc-123-xyz';
    const enc = encryptKey(plaintext);
    expect(enc.startsWith(ENCRYPTION_PREFIX)).toBe(true);
    const dec = decryptKey(enc);
    expect(dec).toBe(plaintext);
  });

  it('produces different ciphertexts for same input (random IV)', () => {
    const a = encryptKey('same');
    const b = encryptKey('same');
    expect(a).not.toBe(b);
    expect(decryptKey(a)).toBe('same');
    expect(decryptKey(b)).toBe('same');
  });

  it('throws on invalid prefix', () => {
    expect(() => decryptKey('not-encrypted')).toThrow();
  });

  it('throws on tampered ciphertext', () => {
    const enc = encryptKey('secret');
    const tampered = enc.slice(0, -4) + 'AAAA';
    expect(() => decryptKey(tampered)).toThrow();
  });

  it('refuses empty input', () => {
    expect(() => encryptKey('')).toThrow();
  });
});
