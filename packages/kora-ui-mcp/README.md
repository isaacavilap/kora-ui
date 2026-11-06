# kora-ui-mcp

Gives AI assistants the [kora-ui](https://kora-ui.istmocode.com) components, props, working examples, and full page templates, so they build with the library and do not guess at its API.

## Connect

Claude Code:

```bash
claude mcp add kora-ui -- npx -y kora-ui-mcp@next
```

Gemini CLI, in `~/.gemini/settings.json`, and other clients that take the same format:

```json
{ "mcpServers": { "kora-ui": { "command": "npx", "args": ["-y", "kora-ui-mcp@next"] } } }
```

Codex CLI, in `~/.codex/config.toml`:

```toml
[mcp_servers.kora-ui]
command = "npx"
args = ["-y", "kora-ui-mcp@next"]
```

ChatGPT and other web clients need a remote server. Add `https://kora-ui.istmocode.com/mcp` as a connector.

## Tools

| Tool | Returns |
|---|---|
| `get_setup` | Install steps, rules, and a complete app shell |
| `list_components` | Every component, by group |
| `get_component` | Import, props, and a working example |
| `list_templates` | Complete pages to start from |
| `get_template` | Full source of a page |
| `search_kora` | Components and templates that match your words |

The package version matches the `kora-ui` version it describes.
