/**
 * Command-line entry for the skill linter: runs the rules in `lint.ts` on every
 * `skills/<name>/SKILL.md` and on README.md, prints the violations, and exits with
 * status 1 if there are any.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { lintReadme, lintSkill } from "./lint.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const skillsDir = join(root, "skills");
const isSkill = (entry: string) =>
  statSync(join(skillsDir, entry)).isDirectory() &&
  existsSync(join(skillsDir, entry, "SKILL.md"));
const entries = readdirSync(skillsDir);
const skills = entries.filter(isSkill);

let total = 0;
const report = (where: string, errors: string[]) => {
  for (const e of errors) console.error(`✗ ${where}: ${e}`);
  total += errors.length;
};
for (const entry of entries.filter((e) => !isSkill(e)))
  report(`skills/${entry}`, ["not a skill directory with a SKILL.md"]);
for (const skill of skills)
  report(
    skill,
    lintSkill(
      skill,
      readFileSync(join(skillsDir, skill, "SKILL.md"), "utf8"),
      skills,
    ),
  );
report(
  "README.md",
  lintReadme(readFileSync(join(root, "README.md"), "utf8"), skills),
);

console.log(
  total
    ? `\n${total} error(s) in ${skills.length} skills`
    : `✓ ${skills.length} skills OK`,
);
process.exit(total ? 1 : 0);
