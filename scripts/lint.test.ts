import assert from "node:assert/strict";
import { test } from "node:test";
import { lintReadme, lintSkill } from "./lint.ts";

const MANUAL = "Use only when the user explicitly invokes it.";
const skill = (frontmatter: string, body = "Body.\n") =>
  `---\n${frontmatter}\n---\n\n${body}`;
const valid = (body?: string) =>
  skill(
    `name: demo\ndescription: Does things. ${MANUAL}\ndisable-model-invocation: true`,
    body,
  );
const lint = (text: string) =>
  lintSkill("demo", text, ["demo", "cleanup", "next-foundation"]);

test("a conforming skill has no errors", () => {
  assert.deepEqual(lint(valid()), []);
});

test("a frontmatter key inside the description is caught", () => {
  const text = skill(
    `name: demo\ndescription: Does things. disable-model-invocation: true`,
  );
  assert.ok(lint(text).some((e) => e.includes("contain a frontmatter key")));
});

test("name must match the directory", () => {
  const text = skill(
    `name: other\ndescription: Does things. ${MANUAL}\ndisable-model-invocation: true`,
  );
  assert.ok(lint(text).some((e) => e.includes("does not match directory")));
});

test("manual-only skills end their description with the standard sentence", () => {
  const text = skill(
    `name: demo\ndescription: Does things.\ndisable-model-invocation: true`,
  );
  assert.ok(lint(text).some((e) => e.includes("must end with")));
});

test("$ARGUMENTS is not used, an argument-hint alone is fine", () => {
  assert.ok(
    lint(valid("Scope: $ARGUMENTS\n")).some((e) => e.includes("$ARGUMENTS")),
  );
  const hintOnly = skill(
    `name: demo\ndescription: Does things. ${MANUAL}\ndisable-model-invocation: true\nargument-hint: "[x]"`,
  );
  assert.deepEqual(lint(hintOnly), []);
});

test("numbered lists have no gaps", () => {
  assert.ok(
    lint(valid("1. a\n2. b\n4. c\n")).some((e) => e.includes("jumps to 4")),
  );
  assert.deepEqual(lint(valid("1. a\n   - nested\n2. b\n")), []);
});

test("naming another skill is caught, a plain word is not", () => {
  assert.deepEqual(lint(valid("A cleanup is not a refactor.\n")), []);
  for (const body of [
    "Run `cleanup` first.\n",
    "Then /cleanup.\n",
    "The cleanup skill helps.\n",
    "After next-foundation.\n",
  ])
    assert.equal(lint(valid(body)).length, 1, body);
  assert.deepEqual(lint(valid("This is `demo`.\n")), []);
});

test("the README lists every skill", () => {
  assert.deepEqual(lintReadme("`demo` and `cleanup`", ["demo", "cleanup"]), []);
  assert.deepEqual(lintReadme("`demo`", ["demo", "cleanup"]), [
    'does not list "cleanup"',
  ]);
});
