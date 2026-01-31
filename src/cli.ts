#!/usr/bin/env node

import { parseArgs } from "node:util";

import { c } from "./utils/colors.ts";
import { addSkill, findSkillsConfig } from "./config.ts";
import { installSkillSource, installSkills } from "./skills.ts";

const name = "skillman";
const version = "0.0.0";

export function parseSource(input: string): { source: string; skills: string[] } {
  // Handle skills.sh URLs: https://skills.sh/owner/repo/skill-name or skills.sh/owner/repo/skill-name
  const skillsShMatch = input.match(/^(?:https?:\/\/)?skills\.sh\/(.+)/)?.[1];
  if (skillsShMatch) {
    const [namespace, repo, ...skills] = skillsShMatch.split("/");
    if (!namespace || !repo) {
      return { source: input, skills: [] };
    }
    const filtered = skills
      .flatMap((s) => s.split(","))
      .map((s) => s.trim())
      .filter(Boolean);
    return { source: `${namespace}/${repo}`, skills: filtered.includes("*") ? [] : filtered };
  }

  const [source = "", ...parts] = input.split(":");
  // Support both colon and comma separators: source:skill1,skill2:skill3
  const skills = parts
    .flatMap((p) => p.split(","))
    .map((s) => s.trim())
    .filter(Boolean);
  return { source, skills: skills.includes("*") ? [] : skills };
}

export async function main(argv: string[] = process.argv.slice(2)): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      agent: { type: "string", multiple: true },
      global: { type: "boolean", short: "g" },
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
    },
  });

  if (values.version) {
    console.log(`${name} ${version}`);
    return;
  }

  const command = positionals[0];

  if (values.help) {
    showUsage(command);
    return;
  }

  if (!command || command === "install" || command === "i") {
    const skillsConfigPath = findSkillsConfig();
    if (!skillsConfigPath) {
      console.log(`${c.yellow}No skills.json found.${c.reset}

Get started by adding a skill source:

${c.dim}$${c.reset} npx ${name} add ${c.cyan}vercel-labs/skills${c.reset}
`);
      return;
    }
    await installSkills({
      yes: true,
      agents: values.agent || ["claude-code"],
      global: values.global,
    });
    return;
  }

  if (command === "add") {
    const sources = positionals.slice(1);
    if (sources.length === 0) {
      showUsage("add");
      throw new Error("Missing skill source.");
    }

    // Parse and deduplicate sources
    const parsedSources: { source: string; skills: string[] }[] = [];
    for (const rawSource of sources) {
      const { source, skills } = parseSource(rawSource);
      const existing = parsedSources.find((p) => p.source === source);
      if (existing) {
        // Merge skills (empty = all, so if either is empty, result is empty)
        if (skills.length === 0 || existing.skills.length === 0) {
          existing.skills = [];
        } else {
          existing.skills = [...new Set([...existing.skills, ...skills])];
        }
      } else {
        parsedSources.push({ source, skills: [...skills] });
      }
    }

    const agents = values.agent || ["claude-code"];
    const globalPrefix = values.global ? `${c.magenta}[ global ]${c.reset} ` : "";

    for (const { source, skills } of parsedSources) {
      await installSkillSource({ source, skills }, { agents, yes: true, global: values.global });
      await addSkill(source, skills);
      console.log(
        `${globalPrefix}${c.green}✔${c.reset} Added ${c.cyan}${source}${c.reset} to skills.json`,
      );
    }
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

function showUsage(command?: string): void {
  if (command === "add") {
    console.log(`
${c.bold}Usage:${c.reset} ${c.cyan}${name} add${c.reset} <source>... [options]

${c.bold}Arguments:${c.reset}
  ${c.cyan}<source>${c.reset}          Skill source ${c.dim}(e.g., vercel-labs/skills:pdf,commit)${c.reset}

${c.bold}Options:${c.reset}
  ${c.cyan}--agent${c.reset} <name>    Target agent ${c.dim}(default: claude-code, can be repeated)${c.reset}
  ${c.cyan}-h, --help${c.reset}        Show this help message

${c.bold}Examples:${c.reset}
  ${c.dim}$${c.reset} ${name} add vercel-labs/skills
  ${c.dim}$${c.reset} ${name} add vercel-labs/skills:pdf,commit
  ${c.dim}$${c.reset} ${name} add vercel-labs/skills:find-skills anthropics/skills:skill-creator
  ${c.dim}$${c.reset} ${name} add https://skills.sh/vercel-labs/skills/pdf
`);
    return;
  }

  if (command === "install" || command === "i") {
    console.log(`
${c.bold}Usage:${c.reset} ${c.cyan}${name} install${c.reset} [options]

${c.bold}Options:${c.reset}
  ${c.cyan}--agent${c.reset} <name>    Target agent ${c.dim}(default: claude-code, can be repeated)${c.reset}
  ${c.cyan}-g, --global${c.reset}      Install skills globally
  ${c.cyan}-h, --help${c.reset}        Show this help message

${c.bold}Examples:${c.reset}
  ${c.dim}$${c.reset} npx ${name} install
  ${c.dim}$${c.reset} npx ${name} install --global
  ${c.dim}$${c.reset} npx ${name} install --agent claude-code --agent cursor
`);
    return;
  }

  console.log(`
${c.bold}${name}${c.reset} ${c.dim}v${version}${c.reset}

Manage project skills declaratively with ${c.cyan}skills.json${c.reset}

${c.bold}Usage:${c.reset} ${c.cyan}${name}${c.reset} <command> [options]

${c.bold}Commands:${c.reset}
  ${c.cyan}install, i${c.reset}        Install skills from skills.json ${c.dim}(default)${c.reset}
  ${c.cyan}add${c.reset}               Add a skill source to skills.json

${c.bold}Options:${c.reset}
  ${c.cyan}-h, --help${c.reset}        Show help for a command
  ${c.cyan}-v, --version${c.reset}     Show version number

${c.bold}Examples:${c.reset}
  ${c.dim}$${c.reset} ${name}                              ${c.dim}# Install all skills${c.reset}
  ${c.dim}$${c.reset} ${name} add vercel-labs/skills       ${c.dim}# Add a skill source${c.reset}
  ${c.dim}$${c.reset} ${name} add owner/repo:pdf,commit    ${c.dim}# Add specific skills${c.reset}
  ${c.dim}$${c.reset} ${name} add org/a:skill1 org/b:skill2 ${c.dim}# Add multiple sources${c.reset}

Run ${c.cyan}${name} <command> --help${c.reset} for command-specific help.
`);
}

main().catch((error) => {
  console.error(`${c.red}error:${c.reset} ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});
