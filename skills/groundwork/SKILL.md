---
name: groundwork
description: Prepares a new project before any code is written, whatever its technology. It creates the git and GitHub repository and writes into AGENTS.md the working principles every later session follows. Use only when the user explicitly invokes it.
disable-model-invocation: true
argument-hint: "[what the project is, and anything worth knowing]"
---

# Groundwork

This prepares a new project, before any code and whatever its technology: a repository on GitHub, and an `AGENTS.md` holding the working principles every later session follows. The stack and its tools come later, built on these principles.

Take what the user said when invoking it as context, along with the folder and the conversation. Ask only about what you can't infer and what would change the result. Adapt to the user: the language they write in, and how much technical detail they want.

## Environment

The project needs git configured with the user's identity and an authenticated GitHub CLI. Help the user with whatever is missing: only they can install software on their machine and sign in to their accounts. Then create the repository, on GitHub too, and push. From then on, you manage git and the remote.

## AGENTS.md

`AGENTS.md`, at the project root, is the only agent instruction file. Claude Code reads it natively, but only when there is no `CLAUDE.md`, `.claude/CLAUDE.md` or `CLAUDE.local.md` in the project or a folder above it (the user's own `~/.claude/CLAUDE.md` doesn't count). Any of those silently replaces it. Create none of them, tell the user if one exists above the project, and state the rule in `AGENTS.md` so later sessions keep it.

Write the principles below into it. Reword and tighten them freely, but keep each one with its reason: the reason is what lets a later agent apply a principle to a case nobody foresaw. Keep `AGENTS.md` to what applies to nearly every task, and put topic-specific detail in `docs/`, with a one-line pointer. Principles specific to a stack come later, written as applications of these, not restatements.

**Definition of done.** Work is finished when the full check passes, you have used the result yourself the way its users will, the docs reflect reality, and the work is committed and pushed. A passing check does not prove that something works. If you lack the means to verify your work, get them rather than skip the verification. Never make a check pass by disabling a rule or skipping a test without saying why.

**Automated checks.** The project has a formatter, a linter, a compiler or type checker, and tests, each with the standard tool for its stack. The formatter covers every file the project keeps, Markdown included, so the layout of docs never depends on who last wrote them. Two commands run the checks. The fast check formats, lints and type-checks, and every turn that changed files ends with it, so problems are caught while they are small. The full check runs everything, including tests and any build, and it is what the definition of done refers to. Formatting is applied by the formatter, never fixed by hand.

**Capabilities first, interfaces second.** What a project can do is its capabilities. Each is written once, as plain code that knows nothing about how it is reached. Interfaces are thin layers on top: a command-line tool, an API, web pages, a notebook, a scheduled job, a game engine. Write capabilities as if several interfaces already used them, so that adding an interface or replacing one never touches them. Below them, a data access layer wraps every data source, such as a database, files or external services. It is the only code that knows how and where data is stored, so changing the storage touches only that layer. Capabilities take everything they need as arguments, including the identity of the caller when it matters. The test: could a small script use the capabilities directly, without going through any interface? This is a way of thinking, not a folder layout, and few principles do as much for the quality of the code.

**Truthful types.** Types say exactly what the domain allows. A value is nullable only if it can really be absent, and a union is used only if the value really takes several shapes. Never weaken a type to satisfy the compiler or the type checker: no escape-hatch types, no unchecked casts, no convenience optionals, no silenced errors. Having to fight the type system means the design needs rethinking. Expected failures (not found, forbidden, invalid input) are part of the types. Unexpected ones are raised. In a dynamic language, this applies to its type annotations and their checker.

**Every fact lives in one place**, so that a change touches as few places as possible.

- What code does is documented in the code, in doc comments, and nowhere else. `docs/` explains what the code can't say on its own: why things are the way they are, how the parts fit together, decisions and their reasons. It points to the code rather than restating it.
- Anything referred to from elsewhere, such as a section, a decision or an item, carries a short, meaningful, permanent ID, never a number, so reordering or inserting never breaks a reference. Numbered lists are fine where the order is the content, as long as nothing refers to an item by its number.

**Knowledge lives in the repo**, not in an agent's own memory, so every agent and every person sees the same truth. `docs/` holds it, organized as the project needs: what the project is and for whom, decisions and their reasons, how things work. `docs/state.md` gives the current picture, so any session can pick up where the last one stopped. The docs change with every change, rewritten rather than appended to, since git keeps the history. When the docs and the code disagree, the code wins, and you fix the docs.

**Git.** The agent manages git. It commits each coherent, passing unit of work with a message that explains why, and pushes. It never commits secrets and never rewrites pushed history.

**Orchestrating sessions.** The main session orchestrates and subagents do the work, so the main session's context stays small and sharp over a long session: everything it reads, it carries to the end.

- One subagent per task, small enough for one short sitting. Its prompt names the task, the doc sections to read (by ID, not whole docs), the files in play, what done means, and a budget: how many tries before it commits what is good and reports what is left. It meets the definition of done for its own work and commits only its own files.
- It reports back in a few lines: what changed, the commit, what it couldn't do, and any question for the user. The main session reads reports and the docs it needs to decide. It doesn't read code or logs, since that is the context the subagent exists to hold.
- Subagents that change files, build or run checks work one at a time: they share the working tree, and a check sees the whole tree, so two at once would trip over each other. Read-only research can run beside them.

**Working with the user.** Product decisions belong to the user. Technical decisions are yours, and so is the quality of the work. When a technical choice affects the user (costs, accounts to create, steps only they can take), say so plainly. When a request conflicts with these principles, say so and propose a better way.

## Done when

- The repository exists on GitHub, and everything is committed and pushed.
- `AGENTS.md` holds the principles. A short README says what the project is and where the docs are. `docs/state.md` gives the current picture, including that groundwork has been applied.

Tell the user what is now in place, and that the next step is the foundation for the project's technology.
