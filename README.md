# Skills

Claude Code skills, one per directory under `skills/` (`skills/<name>/SKILL.md`). Each one is a set of instructions that you run by hand as `/<name>`, optionally followed by any context you want to give, such as `/groundwork a recipe-sharing site`. None of them checks or requires another.

They fall into two groups: skills that start a new project, and standalone skills you can use on any project, at any time.

## Starting a project

A new project starts with `groundwork`. Then a path for the chosen technology builds on it.

### The basis: `groundwork`

Prepares a new project before any code is written, whatever its technology: the git and GitHub repository, and an `AGENTS.md` holding the working principles every later session follows. At their core:

- **Instructions, docs and notes.** `AGENTS.md` says how work is done and changes only when you ask. `docs/` describes the project as it is now and changes with its shape, not with every edit. Working notes stay outside the repo, where losing them costs nothing.
- **Every fact lives in one place.** What code does is documented in its doc comments, and references use stable IDs, never numbers.
- **Truthful types.** Types say exactly what the domain allows, and are never weakened to satisfy the compiler.
- **Capabilities first, interfaces second.** What the project can do is written once, independent of how it is reached (a CLI, an API, web pages, a game engine) and of where its data is stored, so interfaces and storage can be swapped.
- **Automated checks.** A formatter, a linter, a type checker and tests, run by a fast check after every change and a full check at the end of every session that changes code.

### Paths

A path lays the foundation for one technology on top of `groundwork`, then adds features step by step. Its skills are meant to run in the order listed.

**Next.js**, for web applications:

1. `next-foundation` sets up Next.js, Drizzle and a local Postgres through PGlite, with seed data, the checks, CI and the stack's principles.
2. `next-accounts` adds Better Auth accounts, workspaces, permissions, optional teams and the GDPR foundations.

**Godot**, for games in C#:

1. `godot-foundation` sets up a Godot game with its rules in a C# library independent of the engine, fixture states, a debug launch that lets the agent see the game, the checks, CI and the stack's principles.

Other paths can be added the same way, for example Python data science.

## Standalone skills

These work on any project, whether or not it was started with `groundwork`.

- `cleanup` runs behavior-preserving cleanup passes until one finds nothing worth changing.
- `orchestrate` runs a piece of work as an orchestrator: the main session plans and checks, while subagents on smaller models do the work, so its context stays small over long sessions.
- `refocus` audits docs and rules against a goal you state, to find and drop the rules that no longer serve it.

## Installing

Clone this repository, then symlink each skill's directory from `skills/` into `~/.claude/skills/` to use it in every project, or into a project's `.claude/skills/` to use it there only. Always symlink, never copy: a symlink keeps every installed skill identical to the clone, so a `git pull` updates them all, while a copy silently goes stale. From the clone's root:

```sh
mkdir -p ~/.claude/skills
for skill in "$PWD"/skills/*/; do ln -sfn "${skill%/}" ~/.claude/skills/; done
```

If a skill was copied before, delete that copy first; `ln` refuses to replace a directory. Run the loop again after a pull that adds a skill.

## Contributing

Working conventions are in `AGENTS.md`. Run the checks before committing:

```sh
pnpm install
pnpm check:fast   # formats, lints the skills, type-checks the linter
pnpm check        # same, but only verifies formatting
```
