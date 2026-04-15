import { VERSION } from '../../constants.js';
import { c } from '../ui.js';

export function printHelp(): void {
  const help = `
  ${c.bold('whichcc')} ${c.gray(`v${VERSION}`)} — Switch Claude Code between alternative AI providers

  ${c.bold('USAGE')}
    npx whichcc                           ${c.dim('# interactive menu')}
    npx whichcc -p <provider> [flags]     ${c.dim('# launch directly')}

  ${c.bold('PROVIDERS')} (built-in)
    zai       ZAI (Zhipu AI)       https://z.ai/pricing
    kimi      Kimi (Moonshot AI)   https://kimi.com/coding
    minimax   MiniMax              https://www.minimax.io/platform
    alibaba   Alibaba DashScope    https://bailian.console.alibabacloud.com/

  ${c.bold('COMMON FLAGS')}
    -p, --provider <id>        Provider (zai | kimi | minimax | alibaba | custom)
    -m, --model <id>           Model name (defaults to provider default)
    -a, --apikey <key>         Set/update API key for provider
    -sd, --skip-dangerous      Pass --dangerously-skip-permissions to Claude
    -sl, --statusline          Include statusLine config

  ${c.bold('MANAGEMENT')}
    -u, --update               Update model registry from GitHub
    -l, --list                 List all providers and models
    --list-custom              List custom providers only
    --status                   Show current config
    --remove-key               Remove API key for provider (with -p)
    --clean                    Delete session files older than 24h

  ${c.bold('CUSTOM PROVIDERS')}
    --add-custom               Add custom provider (interactive, or with flags below)
    --name <name> --url <url>  Use with --add-custom + -a -m
    --remove-custom <id>       Remove custom provider (+ its key)

  ${c.bold('USER-ADDED MODELS')}
    --add-model <model>        Add model to provider (use with -p [--set-default])
    --remove-model <model>     Remove user-added model (use with -p)
    --set-default              Make added model the default

  ${c.bold('OTHER')}
    --no-launch                Generate session file but don't launch Claude
    --dry-run                  Print session JSON to stdout, don't write
    -v, --version              Show version
    -h, --help                 Show this help

  ${c.bold('EXAMPLES')}
    ${c.dim('# Set key then launch')}
    npx whichcc -p zai -a sk-xxx
    npx whichcc -p zai

    ${c.dim('# Specific model')}
    npx whichcc -p alibaba -m qwen3-coder-plus -sd

    ${c.dim('# Add custom provider via flags')}
    npx whichcc --add-custom --name DeepSeek --url https://api.deepseek.com/anthropic -a sk-xx -m deepseek-r3

    ${c.dim('# User-added model on built-in provider')}
    npx whichcc -p zai --add-model glm-6 --set-default

    ${c.dim('# Sync with GitHub registry')}
    npx whichcc -u

  ${c.bold('MORE')}
    https://github.com/ersinkoc/whichcc
`;
  console.log(help);
}
