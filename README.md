# WhichCC

> **"Hangi Claude Code?"** — Switch Claude Code between alternative AI providers in one command.

```
  ╦ ╦╦ ╦╦╔═╗╦ ╦╔═╗╔═╗
  ║║║╠═╣║║  ╠═╣║  ║
  ╚╩╝╩ ╩╩╚═╝╩ ╩╚═╝╚═╝   v1.0.0
```

`whichcc` is a zero-dependency NPX CLI that manages per-session Claude Code settings for alternative AI providers. Pick a provider (ZAI / Kimi / MiniMax / Alibaba / custom), pick a model, and launch Claude Code with the right `ANTHROPIC_*` env vars — without ever touching your original `~/.claude/settings.json`.

## Quick Start

```bash
# 1) Interactive menu
npx whichcc

# 2) Save a provider API key
npx whichcc -p zai -a sk-xxx...

# 3) Launch with a specific model
npx whichcc -p zai -m glm-5.1

# 4) Sync the model registry from GitHub
npx whichcc -u
```

## Built-in Providers

| ID | Provider | Signup |
|----|----------|--------|
| `zai` | ZAI (Zhipu AI) | https://z.ai/pricing |
| `kimi` | Kimi (Moonshot AI) | https://kimi.com/coding |
| `minimax` | MiniMax | https://www.minimax.io/platform |
| `alibaba` | Alibaba DashScope Coding Plan | https://bailian.console.alibabacloud.com/ |

Run `npx whichcc -l` to see all models.

## Usage

### Interactive

```
npx whichcc
```

Shows a status box of every provider, lets you pick one, optionally prompts for an API key, then asks for a model, confirms flags, writes a session file and spawns `claude` with it.

### Direct launch

```bash
npx whichcc -p kimi                              # default model
npx whichcc -p kimi -m kimi-k2.6-code-preview    # specific model
npx whichcc -p alibaba -m qwen3-coder-plus -sd   # with --dangerously-skip-permissions
```

### Custom providers

Any Anthropic-compatible endpoint works:

```bash
# Interactive
npx whichcc --add-custom

# One-shot
npx whichcc --add-custom \
  --name "DeepSeek" \
  --url "https://api.deepseek.com/anthropic" \
  -a sk-xxx \
  -m deepseek-r3

# Launch it
npx whichcc -p deepseek
```

Remove one:

```bash
npx whichcc --remove-custom deepseek
```

### User-added models

Add a model to any built-in provider without waiting for a registry update:

```bash
npx whichcc -p zai --add-model glm-6 --set-default
npx whichcc -p zai --remove-model glm-6
```

User-added models show with `(*)`. When you run `npx whichcc -u` and the registry now contains that model, it is auto-promoted out of `userModels`.

### Everything else

```bash
npx whichcc --list            # list providers + models
npx whichcc --list-custom     # only custom
npx whichcc --status          # config, keys, sessions
npx whichcc --clean           # remove session files >24h old
npx whichcc -p zai --remove-key
npx whichcc --no-launch -p zai    # write session file only
npx whichcc --dry-run -p zai      # print session JSON to stdout
```

### CLI flags

| Flag | Alias | Value | Description |
|------|-------|-------|-------------|
| `--provider` | `-p` | id | `zai`, `kimi`, `minimax`, `alibaba`, or custom |
| `--model` | `-m` | id | Model name |
| `--apikey` | `-a` | string | Set/update API key |
| `--skip-dangerous` | `-sd` | | Add `--dangerously-skip-permissions` |
| `--statusline` | `-sl` | | Include statusLine config |
| `--update` | `-u` | | Pull registry from GitHub |
| `--list` | `-l` | | List all providers |
| `--list-custom` | | | List only custom providers |
| `--status` | | | Show current config |
| `--remove-key` | | | Remove provider API key |
| `--add-custom` | | | Add custom provider (interactive or flags) |
| `--remove-custom` | | id | Remove custom provider |
| `--add-model` | | id | Add a model to provider |
| `--remove-model` | | id | Remove user-added model |
| `--set-default` | | | Make added/selected model the default |
| `--name` | | string | Custom provider name (with `--add-custom`) |
| `--url` | | url | Custom provider base URL (with `--add-custom`) |
| `--clean` | | | Delete stale session files |
| `--no-launch` | | | Write session file, don't launch |
| `--dry-run` | | | Print session JSON to stdout |
| `--version` | `-v` | | Show version |
| `--help` | `-h` | | Show help |

## How it works

`whichcc` **never** modifies `~/.claude/settings.json`. For every launch it:

1. Resolves the provider (built-in registry + user-added models, or custom).
2. Decrypts the API key from `~/.claude/.whichcc/keys.json`.
3. Writes a one-off `~/.claude/whichcc-<provider>-<timestamp>.json` with the right `ANTHROPIC_*` env vars and (optionally) a `statusLine`.
4. Spawns `claude --settings <that-file>` with your stdio attached.
5. Old session files (>24h) are cleaned up next time you run.

### File layout

```
~/.claude/
├── settings.json                    # your original settings — UNTOUCHED
├── whichcc-zai-<ts>.json            # per-launch session file
└── .whichcc/
    ├── config.json                  # provider defaults, user models, custom providers
    ├── keys.json                    # AES-256-GCM encrypted API keys
    └── registry.json                # cached model registry from GitHub
```

### Security

API keys are encrypted with **AES-256-GCM**. The key is derived with PBKDF2 from `hostname + username + salt`, so copying `keys.json` to another machine will fail to decrypt. Not a hardware-backed keystore — good enough to prevent casual plaintext exposure, and your cleartext key only lives inside the per-session JSON file (which you can purge with `--clean`).

## Requirements

- Node.js ≥ 18
- Claude Code installed (`claude` on `$PATH` / `claude.cmd` on Windows)

## Development

```bash
pnpm install
pnpm test
pnpm build
node dist/index.js --help
```

## License

MIT © [Ersin Koc](https://github.com/ersinkoc)
