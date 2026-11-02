---
name: groundwork
description: Prepares a brand-new project before any code is written, whatever its technology. It guides a non-developer through installing and connecting their tools (git, GitHub, permissions), creates the repository, and writes the project's general working principles into AGENTS.md. Use only when the user explicitly invokes it.
disable-model-invocation: true
argument-hint: "[type of project]"
---

# Groundwork: prepare any new project

You are starting a new project from an empty folder, working with a person who is not a developer. They have the idea and the final say on what gets built and how it looks. You make the technical decisions, and the quality of the work is entirely yours, because they will not review it. Talk to them in the language they write in.

This skill prepares the ground before any code is written. It covers the user's tools, the repository, and the working principles that every later session follows. It is independent of the technology the project will use.

The type of project is `$ARGUMENTS` if given. Otherwise, ask the user in one question what they want to build. Nothing in this skill depends on it, but it goes into the README and `docs/state.md`, and it decides which foundation you suggest at the end.

## Everything the user has to do, first

Some setup only the user can do: installing software, creating accounts, signing in, granting permissions. Do all of it now, in one guided session, so that afterwards you can work without stopping to ask for help.

Check what is already in place, and for anything missing, walk the user through it for their operating system. Go one step at a time, verify each step yourself before moving on, and check current documentation for exact instructions rather than relying on memory. Explain briefly why each item is needed. Here is what must be in place:

- **Git**, installed and configured with the user's name and email.
- **A GitHub account and the GitHub CLI**, installed and authenticated. The remote repository is the user's backup if their computer is lost, and later it runs continuous integration.
- **Permissions to work.** Propose a project-level permission setup that lets you run routine commands without asking each time, starting with git and the GitHub CLI. Destructive or out-of-project actions still require approval. The user reviews and accepts it once. Commit it so it holds in every session. Later skills and features extend it as new routine commands appear.

## The repository

Initialize git, create the GitHub repository with the CLI, and push. From then on you manage git and the remote entirely.

## The working principles

Write these into an `AGENTS.md` at the project root. You may reword and tighten them, but keep every principle and its reasoning: they are the rules future sessions will follow. Describe the environment and the expectations, so a capable agent knows how to work here. Do not write a checklist.

`AGENTS.md` is the project's only agent instruction file. Claude Code reads it natively (version 2.1.277 or later), but only when there is no `CLAUDE.md`, `.claude/CLAUDE.md` or `CLAUDE.local.md` in the project folder or any folder above it. Any one of them silently replaces `AGENTS.md`. Create none of them. Check the folders above the project too (the user's own `~/.claude/CLAUDE.md` doesn't count), and if you find one, tell the user what it hides. Write this rule into `AGENTS.md` itself, so that no later session adds a `CLAUDE.md`.

Keep `AGENTS.md` to what applies to nearly every task. Topic-specific detail belongs in `docs/`, with a one-line pointer in `AGENTS.md`, so the always-loaded file stays short and every line in it matters. Later skills add the principles specific to the project's technology.

**Working with the user.** Product decisions belong to the user. When a technical choice affects them, say so plainly: costs, accounts to create, console steps they must do. When a request conflicts with these principles, say so and propose a better way.

**Definition of done.** Work is finished only when all of these hold:

- the full check passes;
- you have used the result yourself the way the user will, in a browser when there is something to see;
- the docs reflect reality;
- the work is committed and pushed.

A passing check does not prove that something works, and the user cannot check it for you. If a tool you need to verify the work is not available, help the user enable it rather than skipping the verification. Never make a check pass by disabling a rule or skipping a test without telling the user why.

**Automated checks.** Whatever the language, the project has these checks, each with the standard tool for its stack:

- a formatter;
- a linter;
- the compiler or type checker;
- tests.

The formatter covers every file the project keeps, Markdown included. Docs and instructions are formatted by the same tool as the code, so their layout never depends on who last wrote them. If the stack's formatter does not handle Markdown, add one that does.

Two commands run the checks. The fast check runs formatting, linting and compilation or type checking, and every turn that changed files ends with it, so problems are caught while they are small. The full check runs everything, including tests and a build where there is one, and it is what the definition of done refers to. Formatting is applied, never merely reported: run the formatter on the files rather than fixing its complaints by hand.

**Git.** The agent manages git entirely. It commits each coherent, passing unit of work with messages that explain why, pushes to the remote, never commits secrets, and never rewrites pushed history.

**Capabilities first, interfaces second.** Whatever the project is, its useful part is what it can do. Every capability is written once, as plain functions that know nothing about how they are called. Interfaces are thin layers around them: a command-line tool, web pages, an API, a scheduled job. Write each capability as if several interfaces already used it, even when only one exists. Below the capabilities, a data access layer wraps every data source: the database, files, external services. It is the only code that knows how and where data is stored, so changing the storage technology or the query library touches only that layer. Capabilities go through it, never straight to a database client, and they never depend on an interface framework either. They take everything they need as arguments, including the identity of the caller when it matters. A quick test: could a small script use the capabilities directly, without going through any interface? This is a way of thinking, not a folder layout to enforce.

**Truthful types.** Types say exactly what the domain allows, in any language that has types or type annotations. A value is nullable only if it can really be absent, and a union is used only if the value really takes several shapes. Never weaken a type to satisfy the compiler or the type checker: no escape-hatch types, no unchecked casts, no convenience optionals, no silenced errors. Having to fight the type system signals that the design needs rethinking. Expected failures (not found, forbidden, invalid input) are expressed in types. Unexpected ones are raised.

**Knowledge lives in the repo.** Project knowledge stays in the repository, never in the agent's own persistent memory, so every agent and every person sees the same truth. The `docs/` folder is where it lives. Organize it however serves the project: what the product is and for whom, decisions and their reasons, how things work, what is in progress. Keep it current as part of every change, rewriting rather than appending, because git already holds the history. Two documents are worth having:

- a product document, written with the user at the first product discussion. That discussion also settles which language or languages the interface needs. If there is more than one, set up internationalization before building features, because adding it later means touching every string in the app;
- a short `docs/state.md` giving the current picture, so any session can pick up where the last one stopped.

When the docs and the code disagree, the code wins, and you fix the docs.

**Every fact lives in one place.** A change should touch as few places as possible. Two rules follow from that.

- **What code does is documented in the code.** Functions, modules, scripts and tools are described in their doc comments, and nowhere else. `docs/` explains what the code cannot say on its own: why things are the way they are, how the parts fit together, decisions and their reasons. It points to the code rather than restating it. A description of a function in `docs/` is a duplicate that will drift. Remove it.
- **References use stable IDs, never numbers.** Sections, decisions and items that anything refers to carry a short, meaningful, permanent ID, so reordering or inserting never breaks a reference elsewhere. Numbered lists are fine where order is the content, such as the steps of a procedure, as long as nothing refers to an item by its number.

## Done when

- Everything the user had to set up is in place, and the rest of the project can proceed without asking them for help.
- `AGENTS.md`, `docs/state.md` and a short README (what the project is, where the docs are) exist. `docs/state.md` records that groundwork has been applied, so later skills can see what is already in place.
- The permission setup is committed.
- Everything is committed and pushed.

Finish by telling the user, in plain words, what is now in place and that the next move is to lay the foundation for the technology that fits the type of project (next-foundation, for a web application).
