#!/usr/bin/env node

import { parseArgs } from "node:util";

import { c } from "./utils/colors.ts";
import { addSkill, findSkillsConfig } from "./config.ts";
import { installSkills } from "./skills.ts";

const name = "skillman";
const version = "0.0.0";

function parseSource(input: string): { source: string; skills: string[] } {
  const [source = "", ...skills] = input.split(":");
  const filtered = skills.map((skill) => skill.trim()).filter((skill) => skill.length > 0);
  return { source, skills: filtered.includes("*") ? [] : filtered };
}

export async function main(argv: string[] = process.argv.slice(2)): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      agent: { type: "string", multiple: true },
      skill: { type: "string", multiple: true },
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
    await installSkills({ yes: true, agents: values.agent || ["claude-code"] });
    return;
  }

  if (command === "add") {
    const sources = positionals.slice(1);
    if (sources.length === 0) {
      showUsage("add");
      throw new Error("Missing skill source.");
    }
    for (const rawSource of sources) {
      const { source, skills: parsedSkills } = parseSource(rawSource);
      const skills = [...parsedSkills, ...(values.skill ?? [])];
      await addSkill(source, skills);
      const normalizedSkills = skills
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0 && skill !== "*");
      const skillsSuffix =
        normalizedSkills.length > 0 ? ` ${c.dim}(${normalizedSkills.join(", ")})${c.reset}` : "";
      console.log(
        `${c.green}✔${c.reset} Added ${c.cyan}${source}${c.reset} to skills.json${skillsSuffix}`,
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
  ${c.cyan}<source>${c.reset}          Skill source ${c.dim}(e.g., vercel-labs/skills:pdf:commit)${c.reset}

${c.bold}Options:${c.reset}
  ${c.cyan}--skill${c.reset} <name>    Specific skill to add ${c.dim}(can be repeated)${c.reset}
  ${c.cyan}-h, --help${c.reset}        Show this help message

${c.bold}Examples:${c.reset}
  ${c.dim}$${c.reset} ${name} add vercel-labs/skills
  ${c.dim}$${c.reset} ${name} add vercel-labs/skills:pdf:commit
  ${c.dim}$${c.reset} ${name} add vercel-labs/skills --skill pdf --skill commit
  ${c.dim}$${c.reset} ${name} add vercel-labs/skills:find-skills anthropics/skills:skill-creator
`);
    return;
  }

  if (command === "install" || command === "i") {
    console.log(`
${c.bold}Usage:${c.reset} ${c.cyan}${name} install${c.reset} [options]

${c.bold}Options:${c.reset}
  ${c.cyan}--agent${c.reset} <name>    Target agent ${c.dim}(default: claude-code, can be repeated)${c.reset}
  ${c.cyan}-h, --help${c.reset}        Show this help message

${c.bold}Examples:${c.reset}
  ${c.dim}$${c.reset} npx ${name} install
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
  ${c.dim}$${c.reset} ${name} add owner/repo:pdf:commit    ${c.dim}# Add specific skills${c.reset}
  ${c.dim}$${c.reset} ${name} add org/a:skill1 org/b:skill2 ${c.dim}# Add multiple sources${c.reset}

Run ${c.cyan}${name} <command> --help${c.reset} for command-specific help.
`);
}

main().catch((error) => {
  console.error(`${c.red}error:${c.reset} ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});
