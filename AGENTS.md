# Skills repo

This repo holds Claude Code skills for anyone to use, one per directory under `skills/` (`skills/<name>/SKILL.md`), and nothing else lives there. What each skill does is in `README.md`, and the current state of the repo is in `docs/state.md`. The repo follows the `groundwork` skill's principles, applied to itself.

This file is the repo's only agent instruction file. Don't add a `CLAUDE.md`, `.claude/CLAUDE.md` or `CLAUDE.local.md`: Claude Code would then stop reading this one.

## Working with the user

What a skill asks for is the maintainer's decision. When a request makes skills contradict each other or breaks a convention below, say so and propose a better way.

## Definition of done

Work is finished when the full check passes, `README.md` and `docs/state.md` reflect reality, and the work is committed and pushed. A passing check proves only the structure. Before finishing, reread each changed skill the way an agent will read it: cold, with no memory of this conversation, taking every line literally. Never make a check pass by weakening the linter or a rule without telling the user why.

## Checks

- `pnpm check:fast` applies Prettier to every file, Markdown included, then runs the skill linter (`scripts/check.ts`) and `tsc`. Every turn that changes files ends with it.
- `pnpm check` also runs the linter's tests, and only verifies formatting instead of applying it. It is what the definition of done refers to.

The linter's rules are plain functions in `scripts/lint.ts`, tested in `scripts/lint.test.ts`. `scripts/check.ts` only runs them on the repo.

## Git

The agent manages git: it commits each coherent, passing unit of work with a message that explains why, pushes, and never rewrites pushed history. The default branch is `master`.

## How skills are written

Skills are prompts for frontier models. A capable model needs an environment and a goal, not a pipeline.

- **Goal and done, not steps.** A skill says what it is for, what must hold at the end ("Done when"), and the principles and decisions that matter, each with its reason. A few general steps are fine where the order matters, such as reading the goal before the files in `refocus`. Prescribing each step's inputs and outputs is not, and neither is spelling out what any capable model would do anyway.
- **Leave inferable values open.** Don't fix what a model can infer from the project, the environment or the conversation. Fix a value only when it is a real decision, such as the stack in a path.
- **Context at invocation.** Whatever the user types after the command reaches the model after the skill anyway, so skills don't use `$ARGUMENTS`. An `argument-hint` tells users what is worth typing. A skill takes that context, infers the rest, and asks only what it can't infer and what would change the result.
- **No fixed audience.** Skills don't assume who the user is. They adapt to what the user says and how they say it.

## Skill conventions

These hold for every skill, because an agent reads each one in isolation. The linter enforces the first three.

- **Name.** The directory name is the `name` in the frontmatter.
- **Manual only.** Every skill sets `disable-model-invocation: true`, and its description ends with "Use only when the user explicitly invokes it."
- **No enforced order.** A skill never names another skill, checks whether one was applied, or stops because one wasn't. The recommended order, `groundwork` first, then a path for the project's technology, is described in `README.md` only.
- **Principles live in `groundwork`.** Its principles apply to any project. A path writes its own principles as applications of them, not restatements, and the standalone skills work within whatever principles a project states.
- **Shared vocabulary.** The skills share terms with the `AGENTS.md` that `groundwork` writes: "the fast check" and "the full check", "the definition of done", "capabilities" and "interfaces", and `docs/state.md`. When you change one of these terms, change it in every skill.
