import {
  createCipheriv,
  createDecipheriv,
  pbkdf2Sync,
  randomBytes,
} from 'node:crypto';
import { hostname, userInfo } from 'node:os';
import { existsSync, readFileSync, writeFileSync, mkdirSync, chmodSync } from 'node:fs';
import { dirname } from 'node:path';
import type { KeysFile } from '../types.js';
import {
  KEYS_PATH,
  ENCRYPTION_PREFIX,
  ENCRYPTION_SALT,
  PBKDF2_ITERATIONS,
  WHICHCC_DIR,
} from '../constants.js';

function getDerivedKey(): Buffer {
  let username = 'unknown';
  try {
    username = userInfo().username;
  } catch {
    // fallback to unknown
  }
  const password = `${hostname()}${username}${ENCRYPTION_SALT}`;
  return pbkdf2Sync(password, ENCRYPTION_SALT, PBKDF2_ITERATIONS, 32, 'sha256');
}

export function encryptKey(plaintext: string): string {
  if (!plaintext) throw new Error('Cannot encrypt empty key');
  const key = getDerivedKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const combined = Buffer.concat([iv, authTag, encrypted]);
  return ENCRYPTION_PREFIX + combined.toString('base64');
}

export function decryptKey(ciphertext: string): string {
  if (!ciphertext.startsWith(ENCRYPTION_PREFIX)) {
    throw new Error('Invalid encrypted key format');
  }
  const data = Buffer.from(ciphertext.slice(ENCRYPTION_PREFIX.length), 'base64');
  if (data.length < 33) throw new Error('Encrypted payload too short');
  const iv = data.subarray(0, 16);
  const authTag = data.subarray(16, 32);
  const encrypted = data.subarray(32);
  const key = getDerivedKey();
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return plaintext.toString('utf8');
}

export function loadKeys(): KeysFile {
  if (!existsSync(KEYS_PATH)) return {};
  try {
    const raw = readFileSync(KEYS_PATH, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as KeysFile;
  } catch {
    return {};
  }
}

export function saveKeys(keys: KeysFile): void {
  if (!existsSync(WHICHCC_DIR)) mkdirSync(WHICHCC_DIR, { recursive: true });
  const dir = dirname(KEYS_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(KEYS_PATH, JSON.stringify(keys, null, 2), 'utf8');
  try {
    chmodSync(KEYS_PATH, 0o600);
  } catch {
    // Windows or filesystem without chmod support — silently ignore
  }
}

export function setKey(providerId: string, plaintext: string): void {
  const keys = loadKeys();
  keys[providerId] = encryptKey(plaintext);
  saveKeys(keys);
}

export function getKey(providerId: string): string | null {
  const keys = loadKeys();
  const enc = keys[providerId];
  if (!enc) return null;
  try {
    return decryptKey(enc);
  } catch {
    return null;
  }
}

export function removeKey(providerId: string): boolean {
  const keys = loadKeys();
  if (!(providerId in keys)) return false;
  delete keys[providerId];
  saveKeys(keys);
  return true;
}

export function hasKey(providerId: string): boolean {
  const keys = loadKeys();
  const enc = keys[providerId];
  return typeof enc === 'string' && enc.length > 0;
}
