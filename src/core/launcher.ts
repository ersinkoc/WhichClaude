import { spawn } from 'node:child_process';
import { platform } from 'node:os';
import { ANSI } from '../constants.js';

export interface LaunchOptions {
  sessionPath: string;
  skipDangerous: boolean;
}

export function launchClaudeCode(options: LaunchOptions): void {
  const args: string[] = [];
  if (options.skipDangerous) args.push('--dangerously-skip-permissions');
  args.push('--settings', options.sessionPath);

  const isWindows = platform() === 'win32';
  const command = isWindows ? 'claude.cmd' : 'claude';

  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: isWindows,
    detached: false,
  });

  child.on('error', (err) => {
    const e = err as NodeJS.ErrnoException;
    if (e.code === 'ENOENT') {
      console.error(
        `\n  ${ANSI.red}✗${ANSI.reset} Claude Code not found in PATH.\n` +
          `    Install: https://docs.anthropic.com/en/docs/claude-code\n`,
      );
    } else {
      console.error(`\n  ${ANSI.red}✗${ANSI.reset} Failed to launch: ${err.message}\n`);
    }
    process.exit(1);
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}
