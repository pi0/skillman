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
npx skillman                    # Install skills from skills.json (default)
npx skillman install, i         # Same as above
npx skillman add <source>...    # Add skill source(s) to skills.json
```

### Commands

#### `install` (default)

Installs all skills defined in `skills.json`.

```sh
npx skillman install [options]
```

| Option           | Description                                       |
| ---------------- | ------------------------------------------------- |
| `--agent <name>` | Target agent (default: `claude-code`, repeatable) |
| `-g, --global`   | Install skills globally                           |
| `-h, --help`     | Show help                                         |

#### `add`

Adds skill source(s) to `skills.json` and installs them.

```sh
npx skillman add <source>... [options]
```

| Option           | Description                                       |
| ---------------- | ------------------------------------------------- |
| `--agent <name>` | Target agent (default: `claude-code`, repeatable) |
| `-h, --help`     | Show help                                         |

### Source Formats

Sources can be specified in multiple formats:

```sh
# GitHub owner/repo format
npx skillman add vercel-labs/skills

# skills.sh URL
npx skillman add https://skills.sh/vercel-labs/skills/find-skills
npx skillman add skills.sh/vercel-labs/skills/find-skills


# Multiple sources
npx skillman add org/repo-a:skill1 org/repo-b:skill2

# Specify skills (comma separated)
npx skillman add vercel-labs/agent-skills:vercel-deploy,vercel-react-native-skills
```

### Examples

```sh
# Install all skills from skills.json
npx skillman

# Add a skill source (all skills)
npx skillman add vercel-labs/skills

# Add specific skills from a source
npx skillman add vercel-labs/agent-skills:vercel-deploy,vercel-react-native-skills

# Add from skills.sh URL
npx skillman add https://skills.sh/vercel-labs/skills/find-skills

# Install skills globally
npx skillman install --global

# Install for multiple agents
npx skillman install --agent claude-code --agent cursor
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
