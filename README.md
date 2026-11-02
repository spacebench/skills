# Skills

Claude Code skills, one per directory (`<name>/SKILL.md`). Each one is a set of instructions that you run by hand as `/<name>`. None of them checks or requires another.

They fall into two groups: skills that start a new project, and standalone skills you can use on any project, at any time.

## Starting a project

A new project starts with `groundwork`. Then a path for the chosen technology builds on it.

### The basis: `groundwork`

Prepares a new project before any code is written, whatever its technology. It sets up the user's tools (git, GitHub, permissions), creates the repository, and writes into `AGENTS.md` the working principles that every later session follows: the definition of done, the fast and full checks, git, and how knowledge is kept in the repo.

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

Copy a skill's directory into `~/.claude/skills/` to use it in every project, or into a project's `.claude/skills/` to use it there only.

## Contributing

Working conventions are in `AGENTS.md`, and the current state is in `docs/state.md`. Run the checks before committing:

```sh
pnpm install
pnpm check:fast   # formats, lints the skills, type-checks the linter
pnpm check        # same, but only verifies formatting
```
