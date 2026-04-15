import { cleanOldSessions, listSessionFiles } from '../../core/session.js';
import { unlinkSync } from 'node:fs';
import { success, info } from '../ui.js';
import { confirm } from '../interactive.js';

export async function cleanCommand(all = false): Promise<void> {
  if (all) {
    const files = listSessionFiles();
    if (files.length === 0) {
      info('No session files to clean.');
      return;
    }
    const ok = await confirm(`Delete ${files.length} session file(s)?`, false);
    if (!ok) {
      info('Cancelled.');
      return;
    }
    for (const f of files) {
      try {
        unlinkSync(f);
      } catch {
        // ignore
      }
    }
    success(`Removed ${files.length} session file(s).`);
    return;
  }
  const removed = cleanOldSessions();
  if (removed.length === 0) {
    info('No stale session files to clean.');
  } else {
    success(`Removed ${removed.length} session file(s) older than 24h.`);
  }
}
