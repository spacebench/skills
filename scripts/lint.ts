/**
 * The rules every skill follows (see the skill conventions in AGENTS.md), as
 * pure functions over file contents, so they can be tested without a repo.
 */

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

/**
 * Returns the convention violations in one skill's `SKILL.md`: frontmatter with
 * known keys, `name` equal to the directory, manual-only wording, no
 * `$ARGUMENTS` (the user's text follows the skill anyway), gap-free numbered
 * lists, and no mention of another skill, since skills have no enforced order.
 */
export function lintSkill(
  skill: string,
  text: string,
  allSkills: Iterable<string>,
): string[] {
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
  if (body.includes("$ARGUMENTS"))
    errors.push(
      "uses $ARGUMENTS, but the user's text follows the skill anyway",
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

  // Single-word names ("cleanup") are also plain words, so only clear references count.
  for (const other of allSkills) {
    if (other === skill) continue;
    const forms = [`\`${other}\``, `/${other}\\b`, `\\b${other} skill`];
    if (other.includes("-")) forms.push(`\\b${other}\\b`);
    if (new RegExp(forms.join("|")).test(body))
      errors.push(`names another skill, "${other}"`);
  }

  return errors;
}

/** Returns one error per skill that the README doesn't list as `` `name` ``. */
export function lintReadme(readme: string, allSkills: string[]): string[] {
  return allSkills
    .filter((skill) => !readme.includes(`\`${skill}\``))
    .map((skill) => `does not list "${skill}"`);
}
