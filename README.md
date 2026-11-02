# Skills

Claude Code skills, one per directory (`<name>/SKILL.md`). All of them are manual-only and run as `/<name>`. Working conventions are in `AGENTS.md`, and the current state is in `docs/state.md`.

## General purpose

| Skill        | What it does                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------------ |
| `groundwork` | Prepares a new project for any technology: the user's tools, the git and GitHub repository, and `AGENTS.md`. |
| `cleanup`    | Runs behavior-preserving cleanup passes until one finds nothing worth changing.                              |
| `refocus`    | Audits docs and rules against a goal the user states, to find and drop rules that no longer serve it.        |

## Next.js setup

Each skill works on its own, and fits on top of the one before.

| Skill             | What it does                                                                            |
| ----------------- | --------------------------------------------------------------------------------------- |
| `next-foundation` | Next.js, Drizzle and PGlite foundation, with the checks, CI and the stack's principles. |
| `next-accounts`   | Better Auth accounts, workspaces, permissions, optional teams and the GDPR foundations. |

## Installing

Copy a skill's directory into `~/.claude/skills/` to use it in every project, or into a project's `.claude/skills/` to use it there only. Then run it as `/<name>` in Claude Code.

## Checks

```sh
pnpm install
pnpm check:fast   # formats, lints the skills, type-checks the linter
pnpm check        # same, but only verifies formatting
```
