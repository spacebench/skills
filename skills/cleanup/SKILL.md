---
name: cleanup
description: Iterative codebase cleanup. Repeats full passes over the project (dead code, consistency, simplicity, modularity, useless tests), within the project's own principles and with every check passing after each pass, until a pass finds nothing worth changing. Use only when the user explicitly invokes it.
disable-model-invocation: true
argument-hint: "[scope, and anything worth knowing]"
---

# Cleanup

Goal: leave the code in a state where one more full pass would find nothing worth changing. Behavior is preserved, and only the form of the code changes.

Scope: what the user asked for, by default the whole repository, skipping generated, vendored and ignored files.

## The project's principles come first

Read the project's instruction files and docs before judging anything. Their principles are constraints. What they ask for is never a cleanup target, even when it resembles the excess listed below. For example, a layer that keeps capabilities independent of their interfaces or of their storage is structure, not indirection. A doc comment that describes what code does is where that description belongs.

Where the code breaks those principles, bringing it back in line is in scope. Examples: a capability that reaches a database client directly, docs that restate what doc comments already say, a type weakened to silence the compiler. If a principle itself looks wrong, say so in the report. Questioning the rules is not this skill's job.

## Before the first pass

Find the project's checks: its fast and full checks if it defines them. Start from a clean working tree, so the final diff holds only the cleanup. If the tree isn't clean, ask. Run the checks first. Formatting and lint failures are in scope. Failing tests or a failing build mean you stop and report, since behavior preservation can't be verified on a red baseline.

## Passes

Each pass surveys the whole scope afresh, not from memory of the previous pass. It applies the changes that clear the bar, and ends with every check passing: a change that breaks something is fixed properly or reverted. What to look for:

- **Dead code**: unused functions, exports, imports, variables, files, dependencies, config keys, flags that are never toggled, commented-out code.
- **Inconsistency**: the same thing done in different ways (naming, error handling, logging, file layout, recurring patterns). Converge on the project's stated or dominant convention, never a new one.
- **Excess**: indirection that serves no principle, wrappers that only forward, abstractions with one use and no reason, defensive code for impossible cases, functions doing several unrelated things.
- **Modularity**: one responsibility per module, clear boundaries, no circular dependencies. Extract duplication only when it is the same concept, not a coincidental resemblance.
- **Tests**: tests that duplicate others, only exercise mocks, pin implementation details, or cover removed code. Merge near-identical tests into parametrized ones. Never reduce coverage of real behavior.
- **Comments and docs**: stale comments, comments that restate the next line, docs that the code contradicts.

## The bar

Worth it: removes code, removes a concept, makes two things that differ for no reason identical, fixes a misleading name, drops a dependency, makes a module's purpose obvious, brings code back in line with the project's principles.

Not worth it: swapping between equivalent styles, reordering for taste, renaming to a synonym, abstractions "for later", comments or docs added for completeness, anything the formatter or linter doesn't require.

If a later pass might reasonably revert a change, don't make it. When in doubt, prefer the change with the lower line count.

## Stopping

Stop when a full pass finds nothing above the bar. A change that would undo an earlier pass is oscillation, not improvement: skip it. After ten passes, stop and say so, since it usually means the bar is being applied inconsistently.

## Hard rules

- Never commit, stage, stash or create branches. Changes stay in the working tree, and committing is the user's decision after reviewing them.
- No behavior change. Public API, CLI interface, file formats and outputs stay identical, unless something is provably unused.
- If you can't be sure something is unused (library exports, plugin entry points, reflection, string-based dispatch, use by other repos), leave it and list it in the report.
- Never skip or delete a test, add a lint ignore, loosen a type or relax a config to make checks pass.
- No new dependencies. Touch lockfiles only as a dependency removal requires.

## Report

In chat, unless the user's request says otherwise:

- the passes, with one line each;
- net lines added and removed;
- the final status of every check;
- what was deliberately left alone, and why: suspected dead code that can't be verified, larger refactors, principles that look wrong, design questions for a human.
