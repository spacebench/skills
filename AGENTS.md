# Skills repo

This repo is the source of my Claude Code skills, one per directory (`<name>/SKILL.md`). What each skill does is in `README.md`; the current state of the repo is in `docs/state.md`. The structure follows the `groundwork` skill, applied to this repo itself.

This file is the repo's only agent instruction file. Don't add a `CLAUDE.md`, `.claude/CLAUDE.md` or `CLAUDE.local.md`: Claude Code would then stop reading this one.

## Working with the user

The skills are the user's: what a skill asks for is their decision. When a request makes skills contradict each other or breaks a convention below, say so and propose a better way.

## Definition of done

Work is finished when the full check passes, `README.md` and `docs/state.md` reflect reality, and the work is committed and pushed. A passing check proves only the structure. Before finishing, reread each changed skill the way an agent will read it: cold, with no memory of this conversation, taking every line literally. Never make a check pass by weakening the linter or a rule without telling the user why.

## Checks

- `pnpm check:fast` applies Prettier to every file, Markdown included, then runs the skill linter (`scripts/check.ts`) and `tsc`. Every turn that changes files ends with it.
- `pnpm check` runs the same steps, but only verifies formatting instead of applying it. It is what the definition of done refers to.

There are no tests: the only code is the linter, and running it on the skills exercises it. Add tests if the linter grows logic that its run on the skills doesn't cover.

## Git

The agent manages git: it commits each coherent, passing unit of work with a message that explains why, pushes, and never rewrites pushed history. The default branch is `master`.

## Skill conventions

These hold for every skill, because the skills are used together and an agent reads each one in isolation.

- **Name.** The directory name is the `name` in the frontmatter.
- **Manual only.** Every skill sets `disable-model-invocation: true`, and its description ends with "Use only when the user explicitly invokes it." The linter enforces both.
- **Arguments.** A skill has an `argument-hint` exactly when its body reads `$ARGUMENTS` and says what to do without it.
- **Independence.** Each skill works on its own. A skill may fit on top of another (`next-foundation` on `groundwork`), but it never stops because the other was not applied. It reads `AGENTS.md` and `docs/state.md` in the target project, and sets up whatever it relies on that is missing.
- **Shared vocabulary.** The project-setup skills share terms with the `AGENTS.md` they write in target projects: "the fast check" and "the full check", "the definition of done", "the product discussion", and "`docs/state.md` records that <skill> has been applied". When you change one of these terms, change it in every skill.
- **One fact, one place.** A rule lives in the skill that owns it. Other skills point to it rather than restating it, unless the skill must stand alone without that rule.
