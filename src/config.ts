import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

export interface SkillsConfig {
  skills: SkillSource[];
}

export interface SkillSource {
  source: string;
  skills?: string[];
}

export interface SkillsConfigResult {
  config: SkillsConfig;
  path: string;
}

export function findSkillsConfig(cwd: string = process.cwd()): string | undefined {
  let dir = resolve(cwd);
  const root = dirname(dir);

  while (dir !== root) {
    const candidate = join(dir, "skills.json");
    if (existsSync(candidate)) {
      return candidate;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  // Check root as well
  const rootCandidate = join(dir, "skills.json");
  if (existsSync(rootCandidate)) {
    return rootCandidate;
  }

  return undefined;
}

export interface ReadSkillsConfigOptions {
  cwd?: string;
  createIfNotExists?: boolean;
}

function defaultConfig(): SkillsConfig {
  return { skills: [] };
}

export async function readSkillsConfig(
  options: ReadSkillsConfigOptions = {},
): Promise<SkillsConfigResult> {
  const { cwd, createIfNotExists = false } = options;
  const skillsPath = findSkillsConfig(cwd);

  if (!skillsPath) {
    if (createIfNotExists) {
      const newPath = join(resolve(cwd ?? process.cwd()), "skills.json");
      const config = defaultConfig();
      await writeFile(newPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
      return { config, path: newPath };
    }
    throw new Error("skills.json not found in current directory or any parent directory.");
  }

  const raw = await readFile(skillsPath, "utf8");
  const parsed = JSON.parse(raw) as unknown;
  return { config: assertSkillsConfig(parsed), path: skillsPath };
}

export interface UpdateSkillsConfigOptions {
  cwd?: string;
  createIfNotExists?: boolean;
}

export async function updateSkillsConfig(
  updater: (config: SkillsConfig) => void | SkillsConfig | Promise<void | SkillsConfig>,
  options: UpdateSkillsConfigOptions = {},
): Promise<SkillsConfigResult> {
  const { cwd, createIfNotExists = true } = options;
  const { config, path } = await readSkillsConfig({ cwd, createIfNotExists });
  const updated = (await updater(config)) ?? config;
  const validated = assertSkillsConfig(updated);

  await writeFile(path, `${JSON.stringify(validated, null, 2)}\n`, "utf8");
  return { config: validated, path };
}

export interface AddSkillOptions {
  cwd?: string;
  createIfNotExists?: boolean;
}

export async function addSkill(
  source: string,
  skills: string[] = [],
  options: AddSkillOptions = {},
): Promise<SkillsConfigResult> {
  return updateSkillsConfig((config) => {
    const entry = config.skills.find((item) => item.source === source);
    if (!entry) {
      config.skills.push({ source, skills: [...skills] });
      return config;
    }

    const existing = new Set(entry.skills);
    for (const skill of skills) {
      existing.add(skill);
    }

    entry.skills = Array.from(existing);
    return config;
  }, options);
}

function assertSkillsConfig(value: unknown): SkillsConfig {
  if (!value || typeof value !== "object" || !("skills" in value)) {
    throw new Error("Invalid skills.json: missing 'skills' key.");
  }

  return value as SkillsConfig;
}
