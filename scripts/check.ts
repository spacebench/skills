/**
 * Command-line entry for the skill linter: runs the rules in `lint.ts` on every
 * `<skill>/SKILL.md` and on README.md, prints the violations, and exits with
 * status 1 if there are any.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { lintReadme, lintSkill } from "./lint.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const skills = readdirSync(root).filter(
  (d) =>
    !d.startsWith(".") &&
    statSync(join(root, d)).isDirectory() &&
    existsSync(join(root, d, "SKILL.md")),
);

let total = 0;
const report = (where: string, errors: string[]) => {
  for (const e of errors) console.error(`✗ ${where}: ${e}`);
  total += errors.length;
};
for (const skill of skills)
  report(
    skill,
    lintSkill(
      skill,
      readFileSync(join(root, skill, "SKILL.md"), "utf8"),
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
