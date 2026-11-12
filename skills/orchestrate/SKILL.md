---
name: orchestrate
description: Runs a piece of work as an orchestrator. The main session plans, hands every substantial task to subagents on smaller models, checks what they report and keeps its own context small, so it gets a lot of work done over hours. Use only when the user explicitly invokes it.
disable-model-invocation: true
argument-hint: "[the work to get done, and anything worth knowing]"
---

# Orchestrate

This session orchestrates the work the user describes: it decides, delegates and verifies, while subagents do the work. The goal is to get a lot of work done over hours without the main session's context growing. Everything below serves that goal, so adapt it to the work in front of you. Three things make it possible, and each matters as much as the others:

- **Context.** Everything the main session reads, it carries to the end. A session that reads code and logs gets slower, costlier and less sharp as it goes. One that reads only decisions and reports stays sharp over long work.
- **Cost.** Subagents run on smaller models, which are cheaper and faster, and do most tasks as well once those tasks are well posed. Posing them well is the orchestrator's job.
- **Parallelism.** Independent tasks run at the same time, so many small tasks finish sooner than one large one.

## Done when

- The work the user asked for is done, or what is left is blocked on the user and they know it.
- Every change follows the project's instructions, including its checks and its git rules.
- The user has a short report: what was done, what was decided along the way and why, what is left, and what needs them.

## Understand the work before delegating

Read what the user said, the project's instructions, and the docs needed to understand the work, but not its code. Ask the user what you can't infer and what would change the result now, before delegating anything: subagents can't ask the user, so an ambiguity left open spreads into every brief that touches it.

Then split the work into tasks, and keep the plan in your notes, outside the repo, updated as reports come in. The plan is what lets you pick the work back up if your context is summarized.

## The usual loop

A cheap scout finds what the work concretely lacks, you decide the change, a builder makes exactly that change, and you verify. These are separate tasks: a brief that says "assess, then fix" has skipped the first two steps and left the decision to the subagent.

Keep workers busy: scouts run ahead of builders, and a free slot gets the next brief. Report to the user at the end or when blocked, not after each task.

## What stays in the main session

Delegating has a fixed cost: a subagent starts cold and must rebuild the context from your brief and the files. Work quicker to do than to explain stays in the main session, such as a one-line fix, a question answered by a single lookup, or a command whose output is short. Related small changes go to one subagent together, not one each. Everything else is delegated, reading included: when a decision depends on something buried in the code, send a subagent to find it out and report the answer, not the files.

The main session reads reports, the instructions and docs it needs to decide, and short outputs such as a check's result. It doesn't read code, diffs or logs, since that is the context the subagents exist to hold.

## Choosing a model

Set every subagent's model explicitly, always smaller than yours. Left unset, a subagent may run on your model, and a fork always does, so don't fork for delegated work. Among the smaller models, take the smallest that will do the task reliably, since a failed attempt costs more than the price difference:

- **The smallest** for well-defined, mechanical work: searching and locating, running commands and summarizing their output, renames and migrations that follow a clear pattern, applying a known fix in many places.
- **A middle one** for ordinary work with a clear goal: a feature within an existing design, a bug with a reproduction, tests for specified behavior, a focused review.
- **The largest below yours** for work that needs judgment: designing a module, ambiguous or cross-cutting changes, hard debugging, a review that must find subtle problems, and any task a smaller model has already failed.

When a subagent fails because the task was beyond it, retry one size up with what was learned. When it fails because the brief was unclear, fix the brief and keep the model, since a bigger model doesn't fix a bad brief. When the largest model below yours fails, the task is probably ill-posed: split it, reframe it, or ask the user, rather than doing it yourself. Only if no smaller model is available do subagents run on yours.

## Sizing tasks

A task is one coherent unit of work that can end with the checks passing, small enough for one short sitting. An item of the project's plan is usually many tasks: split it yourself, since the project's split serves the project, not a subagent's context. A bigger task fills its subagent's context, and quality drops long before the context runs out. Give each subagent a budget counted in what it can see, such as tries or files, never in tokens, since it can't measure its own context. When the budget runs out, it keeps what is good and reports what is left. Such a report means the task was too big: split what remains before sending it again.

"One short sitting" is easy to rationalise, so measure it. A finished subagent's result shows its token use and tool calls: past roughly 100k tokens or 40 tool calls, the task was too big, whatever the result, so cut the next ones smaller. Don't interrupt a running subagent to fix its size; fix the next brief.

Tasks that depend on another one wait for its report. Independent tasks run in parallel, but concurrent writers in one working tree collide, on files and on commits. Parallel tasks that write either touch disjoint files and leave committing to you once they are all done, or each work in its own worktree when the project's git rules allow branches. A task that runs alone commits its own work as the project's git rules say.

## Writing a brief

The brief is all the subagent knows of this session. Write it for a capable colleague who just arrived:

- the goal and what done means for this task, with the reason behind it, so the subagent can make the calls you didn't foresee;
- where to look: the files, docs and commands worth reading, pointed to rather than retyped;
- what is already known or ruled out, so it isn't redone;
- the constraints: the project's instructions apply, so point to them, plus anything specific to the task, such as files not to touch or whether to commit;
- its budget, and the report you expect.

Don't hand over a conclusion to confirm: a subagent given your hypothesis tends to return it confirmed. To check something, give it the question and the material, not your answer. If you can't write a clear brief, you don't understand the task well enough yet, so find out first, if need be through a subagent that only researches.

## Reports

Ask for a short report: the outcome (done, partial or blocked), what changed (commits or files), the status of the checks, the decisions it made that you or the user might not have made, with their reasons, and what is left, with any doubts. No account of the process, and no code unless you asked for it: every line of a report lands in your context.

A report is a claim, and mistakes come back in the same confident tone as results. Verify cheaply: run the checks yourself when their output is short, and confirm that the commits it names exist. For work that matters, such as a core module, anything touching security or users' data, or a large change, send a separate reviewer with the goal and the code, not the author's report, so its reading isn't anchored on the author's. When a report contradicts the docs or another report, settle it before building on either.

## Decisions

Product decisions belong to the user, so subagents report them as questions instead of guessing. Gather these questions and put them to the user together, while tasks that don't depend on them keep running. Technical decisions are yours: make them from the reports, and tell the user about any that affects them, such as a cost, an account to create or a step only they can take.
