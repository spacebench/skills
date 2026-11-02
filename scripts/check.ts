/**
 * Lints every `<skill>/SKILL.md` in this repo against the conventions in AGENTS.md:
 * valid frontmatter with known keys, `name` equal to the directory, manual-only
 * wording, `argument-hint` present exactly when the body reads `$ARGUMENTS`,
 * gap-free numbered lists, and references to sibling skills that exist.
 * Exits with status 1 if anything is wrong.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const KNOWN_KEYS = new Set([
  "name",
  "description",
  "disable-model-invocation",
  "argument-hint",
  "allowed-tools",
  "model",
  "user-invocable",
]);
const MANUAL_ONLY = "Use only when the user explicitly invokes it.";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const skills = readdirSync(root).filter(
  (d) =>
    !d.startsWith(".") &&
    statSync(join(root, d)).isDirectory() &&
    existsSync(join(root, d, "SKILL.md")),
);
const skillNames = new Set(skills);

function lint(skill: string, text: string): string[] {
  const errors: string[] = [];
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return ["missing YAML frontmatter"];

  const fm = new Map<string, string>();
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^([a-z-]+):\s*(.*)$/);
    if (kv) fm.set(kv[1], kv[2].replace(/^"(.*)"$/, "$1"));
    else errors.push(`unparsable frontmatter line: ${line}`);
  }
  for (const key of fm.keys())
    if (!KNOWN_KEYS.has(key)) errors.push(`unknown frontmatter key "${key}"`);

  const description = fm.get("description") ?? "";
  if (fm.get("name") !== skill)
    errors.push(`name "${fm.get("name")}" does not match directory`);
  if (!description) errors.push("empty description");
  if (/\b[a-z]+(-[a-z]+)+:\s/.test(description))
    errors.push("description seems to contain a frontmatter key");
  const manual = fm.get("disable-model-invocation");
  if (manual !== undefined && manual !== "true" && manual !== "false")
    errors.push("disable-model-invocation must be true or false");
  if (manual === "true" && !description.endsWith(MANUAL_ONLY))
    errors.push(`manual-only description must end with "${MANUAL_ONLY}"`);

  const body = text.slice(match[0].length);
  const readsArguments = body.includes("$ARGUMENTS");
  if (readsArguments !== fm.has("argument-hint"))
    errors.push(
      readsArguments
        ? "body reads $ARGUMENTS but there is no argument-hint"
        : "argument-hint is set but the body never reads $ARGUMENTS",
    );

  let expected = 1;
  for (const line of body.split("\n")) {
    const item = line.match(/^(\d+)\. /);
    if (item) {
      if (Number(item[1]) !== expected)
        errors.push(
          `list numbering jumps to ${item[1]} (expected ${expected})`,
        );
      expected = Number(item[1]) + 1;
    } else if (line.trim() && !/^\s/.test(line)) expected = 1;
  }

  for (const ref of body.matchAll(
    /\b(next-[a-z]+|groundwork|cleanup|refocus)\b/g,
  ))
    if (!skillNames.has(ref[1]))
      errors.push(`references unknown skill "${ref[1]}"`);

  return errors;
}

let total = 0;
for (const skill of skills) {
  const errors = lint(
    skill,
    readFileSync(join(root, skill, "SKILL.md"), "utf8"),
  );
  for (const e of errors) console.error(`✗ ${skill}: ${e}`);
  total += errors.length;
}
console.log(
  total
    ? `\n${total} error(s) in ${skills.length} skills`
    : `✓ ${skills.length} skills OK`,
);
process.exit(total ? 1 : 0);
