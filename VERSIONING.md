# Versioning

`kora-ui` and `kora-ui-mcp` follow [semantic versioning](https://semver.org) and always share one version, because the MCP server describes that exact library.

## What each number means

| Change | Bump | Examples |
|---|---|---|
| Something stops working in code that uses the library | Major | Remove or rename a component, prop, or `--kora-*` token. Change a default so that a screen behaves differently |
| New and compatible | Minor | New component, prop, template, or label |
| Fix with no change to the API | Patch | Bug, accessibility, or responsive fix |

Internal `kr:` classes and private DOM structure are not part of the API.

## Each change

```bash
npx changeset        # Choose the bump and describe the change for people who use the library
git add .changeset   # Commit it with your change
```

## Each release

1. A merge to `main` with changesets makes CI open a pull request named "chore: version packages". It has the new versions and changelogs.
2. A merge of that pull request publishes to npm and creates the git tags. You choose when to release.

Publishing needs the `NPM_TOKEN` secret in the GitHub repository.

## Channels

| Tag | Install | For |
|---|---|---|
| `next` | `npm install kora-ui@next` | Prereleases of 1.0.0. This is the current mode |
| `latest` | `npm install kora-ui` | Stable. It stays on 0.4.0 until 1.0.0 is published |

To leave prerelease mode and publish 1.0.0, run `npx changeset pre exit`.

## Other rules

- Before a major version, mark the old API as `@deprecated` for at least one minor version when that is possible.
- Update the base project, [kora-starter](https://github.com/isaacavilap/kora-starter), when a major version is published.
