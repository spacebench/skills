# Skills

Claude Code skills, one per directory under `skills/` (`skills/<name>/SKILL.md`). Each one is a set of instructions that you run by hand as `/<name>`, optionally followed by any context you want to give, such as `/groundwork a recipe-sharing site`. None of them checks or requires another.

They fall into two groups: skills that start a new project, and standalone skills you can use on any project, at any time.

## Starting a project

A new project starts with `groundwork`. Then a path for the chosen technology builds on it.

### The basis: `groundwork`

Prepares a new project before any code is written, whatever its technology: the git and GitHub repository, and an `AGENTS.md` holding the working principles every later session follows. At their core:

- **Capabilities first, interfaces second.** What the project can do is written once, independent of how it is reached (a CLI, an API, web pages, a game engine) and of where its data is stored, so interfaces and storage can be swapped.
- **Truthful types.** Types say exactly what the domain allows, and are never weakened to satisfy the compiler.
- **Every fact lives in one place.** What code does is documented in its doc comments, docs explain the why, and references use stable IDs, never numbers.
- **Automated checks.** A formatter, a linter, a type checker and tests, run by a fast check after every change and a full check before work counts as done.

### Paths

A path lays the foundation for one technology on top of `groundwork`, then adds features step by step. Its skills are meant to run in the order listed.

**Next.js**, for web applications:

1. `next-foundation` sets up Next.js, Drizzle and a local Postgres through PGlite, with seed data, the checks, CI and the stack's principles.
2. `next-accounts` adds Better Auth accounts, workspaces, permissions, optional teams and the GDPR foundations.

Other paths can be added the same way, for example Python data science.

## Standalone skills

These work on any project, whether or not it was started with `groundwork`.

- `cleanup` runs behavior-preserving cleanup passes until one finds nothing worth changing.
- `refocus` audits docs and rules against a goal you state, to find and drop the rules that no longer serve it.

## Installing

Copy a skill's directory from `skills/` into `~/.claude/skills/` to use it in every project, or into a project's `.claude/skills/` to use it there only.

## Contributing

Working conventions are in `AGENTS.md`, and the current state is in `docs/state.md`. Run the checks before committing:

```sh
pnpm install
pnpm check:fast   # formats, lints the skills, type-checks the linter
pnpm check        # same, but only verifies formatting
```
