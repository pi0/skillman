import { c } from "./utils/colors.ts";
import { updateSkillsConfig } from "./config.ts";

export interface DetectOptions {
  cwd?: string;
}

export async function detectSkills(options: DetectOptions = {}): Promise<void> {
  const cwd = options.cwd ?? process.cwd();

  console.log(`🔍 Detecting skills in current project`);

  // https://github.com/vercel-labs/skills-detector
  const { detect } = await import("skills-detector");
  const detected = await detect({ cwd });

  const keywords: Set<string> = new Set();

  console.log(`\n${c.bold}Detected:${c.reset}`);
  for (const [key, value] of Object.entries(detected)) {
    const items = Array.isArray(value) ? (value.length > 0 ? value.join(", ") : "-") : value || "-";
    if (Array.isArray(value)) {
      for (const item of value) {
        keywords.add(item);
      }
    } else if (typeof value === "string" && value) {
      keywords.add(value);
    }
    console.log(`  ${c.cyan}${key}${c.reset}: ${items}`);
  }
  console.log();

  await updateSkillsConfig(
    (config) => {
      config.detected = detected;
    },
    { cwd, createIfNotExists: true },
  );

  console.log(`${c.green}✔${c.reset} Updated skills.json with detected information.`);

  console.log(`\n${c.bold}Searching for suggested skills...${c.reset}`);
  const suggestedSkills = await Promise.all(
    Array.from(keywords).map(async (keyword) => {
      const skills = await searchSkillsAPI(keyword);
      return skills;
    }),
  ).then((r) => r.flat());

  // Normalize: unique by source, group skills[] per source
  const skillsBySource = new Map<string, string[]>();
  for (const skill of suggestedSkills) {
    if (!skill.source) continue;
    const existing = skillsBySource.get(skill.source) || [];
    if (!existing.includes(skill.slug)) {
      existing.push(skill.slug);
    }
    skillsBySource.set(skill.source, existing);
  }

  if (skillsBySource.size > 0) {
    console.log(`\n${c.bold}Suggested Skills:${c.reset}`);
    for (const [source, skills] of skillsBySource) {
      console.log(`  ${c.cyan}${source}${c.reset}: ${skills.join(", ")}`);
    }
    const sources = Array.from(skillsBySource.entries())
      .map(([source, skills]) => `${source}:${skills.join(",")}`)
      .join(" ");
    console.log(`\n${c.dim}Use command below to install all detected skills:${c.reset}\n`);
    console.log(`npx skillman add ${sources}\n`);
  }
}

// Search Skills via API

// Source: https://github.com/vercel-labs/skills/blob/main/src/find.ts#L27

const SEARCH_API_BASE = process.env.SKILLS_API_URL || "https://skills.sh";

export interface SearchSkill {
  name: string;
  slug: string;
  source: string;
  installs: number;
}

// Search via API
export async function searchSkillsAPI(query: string): Promise<SearchSkill[]> {
  try {
    const url = `${SEARCH_API_BASE}/api/search?q=${encodeURIComponent(query)}&limit=1`;
    const res = await fetch(url);

    if (!res.ok) return [];

    const data = (await res.json()) as {
      skills: Array<{
        id: string;
        name: string;
        installs: number;
        topSource: string | null;
      }>;
    };

    return data.skills.map((skill) => ({
      name: skill.name,
      slug: skill.id,
      source: skill.topSource || "",
      installs: skill.installs,
    }));
  } catch {
    return [];
  }
}
