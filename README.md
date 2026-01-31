# 🤹 skillman

Manage project Agent [skills](https://skills.sh/) from `skills.json`. Uses [`skills`](https://github.com/vercel-labs/skills) CLI under the hood.

## Usage

**Install all skills from `skills.json`:**

```bash
npx skillman
```

<p align="center">
  <img src="./assets/install.svg" alt="Install preview">
</p>

**Add new skills to project:**

```bash
npx skillman add skills.sh/vercel-labs/skills/find-skills

npx skillman add anthropics/skills:skill-creator
```

<p align="center">
  <img src="./assets/add.svg" alt="Install preview">
</p>

This creates a `skills.json` file:

```json
{
  "$schema": "https://unpkg.com/skillman/skills_schema.json",
  "skills": [
    { "source": "vercel-labs/skills", "skills": ["find-skills"] },
    { "source": "anthropics/skills", "skills": ["skill-creator"] }
  ]
}
```

## CLI Usage

```sh
skillman                    # Install skills from skills.json (default)
skillman install, i         # Same as above
skillman add <source>...    # Add skill source(s) to skills.json
```

### Commands

#### `install` (default)

Installs all skills defined in `skills.json`.

```sh
skillman install [options]
```

| Option           | Description                                       |
| ---------------- | ------------------------------------------------- |
| `--agent <name>` | Target agent (default: `claude-code`, repeatable) |
| `-g, --global`   | Install skills globally                           |
| `-h, --help`     | Show help                                         |

#### `add`

Adds skill source(s) to `skills.json` and installs them.

```sh
skillman add <source>... [options]
```

| Option           | Description                                       |
| ---------------- | ------------------------------------------------- |
| `--skill <name>` | Specific skill to add (repeatable)                |
| `--agent <name>` | Target agent (default: `claude-code`, repeatable) |
| `-g, --global`   | Install skills globally                           |
| `-h, --help`     | Show help                                         |

### Source Formats

Sources can be specified in multiple formats:

```sh
# GitHub owner/repo format
skillman add vercel-labs/skills

# With inline skills (colon-separated)
skillman add vercel-labs/skills:pdf:commit

# skills.sh URL
skillman add https://skills.sh/vercel-labs/skills/pdf
skillman add skills.sh/vercel-labs/skills/pdf

# Multiple sources
skillman add org/repo-a:skill1 org/repo-b:skill2
```

### Examples

```sh
# Install all skills from skills.json
npx skillman

# Install skills globally
npx skillman install --global

# Install for multiple agents
npx skillman install --agent claude-code --agent cursor

# Add a skill source (all skills)
npx skillman add vercel-labs/skills

# Add specific skills from a source
npx skillman add vercel-labs/skills:pdf:commit

# Add using --skill flag
npx skillman add vercel-labs/skills --skill pdf --skill commit

# Add from skills.sh URL
npx skillman add https://skills.sh/vercel-labs/skills/find-skills
```

## Development

🤖 Are you a robot? Read [AGENTS.md](./AGENTS.md).

<details>

<summary>local development</summary>

- Clone this repository
- Install latest LTS version of [Node.js](https://nodejs.org/en/)
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
- Install dependencies using `pnpm install`
- Run interactive tests using `pnpm dev`

</details>

## Alternatives

- Proposal PR for adding `skill-lock.json` ([vercel-labs/skills#234](https://github.com/vercel-labs/skills/pull/234))
- Proposal PR for adding `.skills` ([vercel-labs/skills#134](https://github.com/vercel-labs/skills/pull/134))
- [hairyf/skills-manifest](https://github.com/hairyf/skills-manifest)

## License

Published under the [MIT](https://github.com/unjs/skillman/blob/main/LICENSE) license 💛.
