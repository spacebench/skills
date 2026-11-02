---
name: cleanup
description: Iterative codebase cleanup loop. Repeats full passes over the project (dead code removal, consistency, simplicity, modularity, useless test pruning) with lint, format, build and tests passing after each pass, until a pass finds nothing worth changing. Use only when the user explicitly invokes it.
disable-model-invocation: true
argument-hint: "[optional path or scope]"
---

# Cleanup loop

Goal: leave the codebase in a state where one more full pass would find nothing worth changing. Behavior is preserved; only the form of the code changes.

Scope: `$ARGUMENTS` if provided, otherwise the whole repository. Skip generated, vendored and gitignored files.

## Setup (once)

1. Discover the project's checks: lint, format, typecheck/compile, tests. Look at package.json scripts, Makefile, justfile, Cargo.toml, pyproject.toml, CI config and CLAUDE.md. Write down the exact commands.
2. Make sure the git working tree is clean, so the final `git diff` contains only the cleanup. If it is not, stop and ask.
3. Run every check before changing anything. Lint and format failures are in scope and become pass 0. If tests or the build fail at baseline, stop and report: behavior preservation can't be verified on a red baseline.

## One pass

1. Survey the whole scope fresh. Do not rely on what you remember from the previous pass.
2. Collect candidate changes:
   - **Dead code**: unused functions, exports, imports, variables, files, dependencies, config keys, flags that are never toggled, commented-out code.
   - **Consistency**: the same thing done the same way everywhere (naming, error handling, logging, file layout, recurring patterns). Converge on the dominant existing convention; do not invent a new one.
   - **Simplicity**: needless indirection, single-use abstractions, wrappers that only forward, premature generalization, defensive code for impossible cases, functions doing several unrelated things.
   - **Modularity**: one responsibility per module, clear boundaries, no circular dependencies. Extract duplication only when it is the same concept, not a coincidental resemblance.
   - **Tests**: remove tests that duplicate others, only exercise mocks, pin implementation details, or cover removed code. Merge near-identical tests into parametrized ones. Never reduce coverage of real behavior.
   - **Comments and docs**: remove stale or obvious comments; fix those the code contradicts.
3. Filter every candidate through the bar below. Drop what doesn't clear it.
4. Apply the changes, then run all checks. Everything must pass. If a change breaks something, fix it properly or revert that change.
5. Note a one-line summary of the pass for the final report.

## The bar: what is worth changing

Worth it: removes code, removes a concept, makes two things that differ for no reason identical, fixes a misleading name, drops a dependency, makes a module's purpose obvious.

Not worth it: swapping between equivalent styles, reordering for taste, renaming to a synonym, abstractions "for later", comments or docs added for completeness, anything the formatter or linter doesn't require.

Tie-breakers: if a later pass might reasonably revert it, don't make it. When in doubt, prefer the change with the lower line count.

## Stop condition

- Stop when a full pass finds nothing above the bar.
- If a pass would undo a change from an earlier pass, skip that change: it is oscillation, not improvement.
- Hard cap at 10 passes; if reached, stop and report it, since it usually means the bar is being applied inconsistently.

## Hard rules

- Never commit, stage, stash, or create branches. All changes stay uncommitted in the working tree; committing is the user's decision after reviewing the result.
- No behavior change. Public API, CLI interface, file formats and outputs stay identical, unless something is provably unused.
- If you can't be sure something is unused (library exports, plugin entry points, reflection, string-based dispatch, use by other repos), leave it and list it in the report.
- Never skip or delete a test, add a lint ignore, loosen a type, or relax a config to make checks pass.
- No new dependencies.
- Touch lockfiles only as required by a dependency removal.

## Final report

- Number of passes and a one-line summary per pass
- Net lines added/removed
- Final status of every check
- Items deliberately left alone, with the reason (suspected dead but unverifiable, larger refactors outside cleanup scope, design questions for a human)
