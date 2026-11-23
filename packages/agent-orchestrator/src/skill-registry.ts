/**
 * Multi-Agent Skill Registry
 * Maps agents to designated skills in .agents/skills/
 */

import path from 'path';
import fs from 'fs';

export interface RegisteredSkill {
  id: string;
  name: string;
  description: string;
  skillPath: string;
}

export class SkillRegistry {
  private static instance: SkillRegistry;
  private skills: Map<string, RegisteredSkill> = new Map();

  private constructor() {
    this.discoverSkills();
  }

  public static getInstance(): SkillRegistry {
    if (!SkillRegistry.instance) {
      SkillRegistry.instance = new SkillRegistry();
    }
    return SkillRegistry.instance;
  }

  private discoverSkills(): void {
    const baseDir = path.resolve(process.cwd(), '.agents', 'skills');
    if (!fs.existsSync(baseDir)) return;

    const entries = fs.readdirSync(baseDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillMd = path.join(baseDir, entry.name, 'SKILL.md');
        if (fs.existsSync(skillMd)) {
          const content = fs.readFileSync(skillMd, 'utf8');
          const lines = content.split('\n');
          let description = '';
          for (const line of lines) {
            if (line.startsWith('description:')) {
              description = line.replace('description:', '').trim();
              break;
            }
          }
          this.skills.set(entry.name, {
            id: entry.name,
            name: entry.name.replace(/^[0-9]+-/, '').replace(/-/g, ' '),
            description: description || `Production skill ${entry.name}`,
            skillPath: skillMd,
          });
        }
      }
    }
  }

  public getSkill(id: string): RegisteredSkill | undefined {
    return this.skills.get(id);
  }

  public listSkills(): RegisteredSkill[] {
    return Array.from(this.skills.values());
  }

  public getSkillPrompt(id: string): string {
    const skill = this.skills.get(id);
    if (!skill || !fs.existsSync(skill.skillPath)) return '';
    return fs.readFileSync(skill.skillPath, 'utf8');
  }
}

export const defaultSkillRegistry = SkillRegistry.getInstance();
