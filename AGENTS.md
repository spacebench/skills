# Skills repo

This repo holds Claude Code skills for anyone to use, one per directory under `skills/` (`skills/<name>/SKILL.md`), and nothing else lives there. What each skill does is in `README.md`.

This file is the repo's only agent instruction file. Don't add a `CLAUDE.md`, `.claude/CLAUDE.md` or `CLAUDE.local.md`: Claude Code would then stop reading this one.

## Working with the user

What a skill asks for is the maintainer's decision. When a request makes skills contradict each other or breaks a convention below, say so and propose a better way.

## Ending a session

A session that changed files ends with the full check passing, `README.md` reflecting reality, and the work committed and pushed. A passing check proves only the structure, so before finishing, reread each changed skill the way an agent will read it: cold, with no memory of this conversation, taking every line literally. Never make a check pass by weakening the linter or a rule without telling the user why.

## Checks

`pnpm check:fast` is the fast check: it formats every file, Markdown included, lints the skills and type-checks, and every turn that changes files ends with it. `pnpm check` is the full check: it verifies formatting instead of applying it, and also runs the linter's tests.

## Git

The agent manages git: it commits each coherent, passing unit of work with a message that explains why, pushes, and never rewrites pushed history. The default branch is `master`.

A commit message starts with a short, clear title line. Each paragraph of the body stays on one line, never hard-wrapped, because tools that display the message reflow it, and wrapped lines show up broken there.

## How skills are written

Skills are prompts for frontier models. A capable model needs an environment and a goal, not a pipeline.

- **Goal and done, not steps.** A skill says what it is for, what must hold at the end ("Done when"), and the principles and decisions that matter, each with its reason. A few general steps are fine where the order matters, such as reading the goal before the files in `refocus`. Prescribing each step's inputs and outputs is not, and neither is spelling out what any capable model would do anyway.
- **Instruct less.** When in doubt, leave a line out. Add one only when an agent actually gets something wrong without it, not because it might.
- **Leave inferable values open.** Don't fix what a model can infer from the project, the environment or the conversation. Fix a value only when it is a real decision, such as the stack in a path.
- **Context at invocation.** Whatever the user types after the command reaches the model after the skill anyway, so skills don't use `$ARGUMENTS`. An `argument-hint` tells users what is worth typing. A skill takes that context, infers the rest, and asks only what it can't infer and what would change the result.
- **No fixed audience.** Skills don't assume who the user is. They adapt to what the user says and how they say it.

## Skill conventions

These hold for every skill, because an agent reads each one in isolation. The linter enforces the first three.

- **Name.** The directory name is the `name` in the frontmatter.
- **Manual only.** Every skill sets `disable-model-invocation: true`, and its description ends with "Use only when the user explicitly invokes it."
- **No enforced order.** A skill never names another skill, checks whether one was applied, or stops because one wasn't. The recommended order, `groundwork` first, then a path for the project's technology, is described in `README.md` only.
- **Principles live in `groundwork`.** Its principles apply to any project. A path writes its own principles as applications of them, not restatements, and the standalone skills work within whatever principles a project states.
- **Shared vocabulary.** The skills share terms with the `AGENTS.md` that `groundwork` writes: "the fast check" and "the full check", "capabilities" and "interfaces", and "instructions", "docs" and "notes". When you change one of these terms, change it in every skill.
