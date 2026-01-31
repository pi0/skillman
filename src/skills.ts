import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

import { c } from "./utils/colors.ts";
import { readSkillsConfig } from "./config.ts";
import { addGitignoreEntry } from "./utils/gitignore.ts";

export interface InstallSkillsOptions {
  cwd?: string;
  agents?: string[];
  global?: boolean;
  yes?: boolean;
}

export async function findSkillsBinary(cwd: string = process.cwd()): Promise<string | undefined> {
  let dir = resolve(cwd);
  const root = dirname(dir);

  while (dir !== root) {
    const candidate = join(dir, "node_modules", ".bin", "skills");
    if (existsSync(candidate)) {
      return candidate;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return undefined;
}

export async function installSkills(options: InstallSkillsOptions = {}): Promise<void> {
  const { config, path: configPath } = await readSkillsConfig({ cwd: options.cwd });
  const configDir = dirname(configPath);
  const skillsBinary = await findSkillsBinary(options.cwd);

  // Ensure .agents is in .gitignore
  await addGitignoreEntry(".agents", { cwd: configDir });

  const total = config.skills.length;
  const totalStart = performance.now();
  console.log(`🤹 Installing ${total} skill${total === 1 ? "" : "s"}...\n`);

  let i = 0;
  for (const entry of config.skills) {
    i++;
    const skillList =
      (entry.skills?.length || 0) > 0 ? ` ${c.dim}(${entry.skills!.join(", ")})${c.reset}` : "";
    console.log(`${c.cyan}◐${c.reset} [${i}/${total}] Installing ${entry.source}${skillList}`);

    const [command, args] = skillsBinary
      ? [skillsBinary, ["add", entry.source]]
      : ["npx", ["skills", "add", entry.source]];

    if ((entry.skills?.length || 0) > 0) {
      args.push("--skill", ...entry.skills!);
    } else {
      args.push("--skill", "*");
    }

    if (options.agents && options.agents.length > 0) {
      args.push("--agent", ...options.agents);
    }

    if (options.global) {
      args.push("--global");
    }

    if (options.yes) {
      args.push("--yes");
    }

    if (process.env.DEBUG) {
      console.log(`${c.dim}$ ${["skills", ...args].join(" ")}${c.reset}\n`);
    }

    const skillStart = performance.now();
    await runCommand(command, args);
    const skillDuration = formatDuration(performance.now() - skillStart);
    console.log(
      `${c.green}✔${c.reset} Installed ${entry.source} ${c.dim}(${skillDuration})${c.reset}\n`,
    );
  }

  const totalDuration = formatDuration(performance.now() - totalStart);
  console.log(
    `🎉 Done! ${total} skill${total === 1 ? "" : "s"} installed in ${c.green}${totalDuration}${c.reset}.`,
  );
}

// --- Internal helpers ---

function formatDuration(ms: number): string {
  ms = Math.round(ms);
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.round(ms / 1000);
  return seconds < 60 ? `${seconds}s` : `${Math.round(seconds / 60)}m`;
}

function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];

    const child = spawn(command, args, { stdio: "pipe" });

    child.stdout.on("data", (data: Buffer) => stdout.push(data));
    child.stderr.on("data", (data: Buffer) => stderr.push(data));

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      const output = [Buffer.concat(stdout).toString(), Buffer.concat(stderr).toString()]
        .filter(Boolean)
        .join("\n");

      if (output) {
        console.error(output);
      }

      reject(new Error(`${command} exited with code ${code ?? "unknown"}.`));
    });
  });
}
