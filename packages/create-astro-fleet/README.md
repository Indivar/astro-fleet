# create-astro-fleet

Scaffold an [Astro Fleet](https://github.com/indivar/astro-fleet) monorepo, or add a new site to an existing one.

## Usage

Bootstrap a new fleet (interactive):

```bash
npm create astro-fleet
# or
bunx create-astro-fleet
```

Add a site to the current fleet:

```bash
bunx create-astro-fleet add acme.com saas
```

Non-interactive:

```bash
bunx create-astro-fleet ./my-fleet --domain acme.com --preset saas
```

## Commands

| Command                      | Purpose                                           |
| ---------------------------- | ------------------------------------------------- |
| `init [dir]` *(default)*     | Download the fleet template, scaffold first site  |
| `add <domain> [preset]`      | Add a site to the fleet containing the CWD        |
| `help`                       | Show help                                         |

## Presets

- `corporate` — navy + gold, serif headings. Consulting, finance, law.
- `saas` — dark + neon, geometric sans. Developer tools, B2B SaaS.
- `warm` — cream + amber, display serif. Restaurants, wellness, retail.

## Options

### `init`

- `--template <source>` — giget source, default `github:indivar/astro-fleet`
- `--domain <name>` — skip the first-site domain prompt
- `--preset <name>` — skip the preset prompt
- `--keep-demos` — keep the three demo sites as reference
- `--no-install` — skip dependency install (reserved; not yet implemented)

### `add`

- `--preset <name>` — default `corporate`

## License

MIT
