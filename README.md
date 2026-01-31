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
npx skillman add \
  vercel-labs/skills:find-skills \
  anthropics/skills:skill-creator
```

<p align="center">
  <img src="./assets/add.svg" alt="Install preview">
</p>

This creates a `skills.json` file:

```json
{
  "skills": [
    { "source": "vercel-labs/skills", "skills": ["find-skills"] },
    { "source": "anthropics/skills", "skills": ["skill-creator"] }
  ]
}
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
