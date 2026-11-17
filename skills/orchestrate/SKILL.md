---
name: orchestrate
description: Runs a piece of work as an orchestrator, up to the point the user sets. Each task runs in a subagent with a fresh context, a few at a time, instead of one after another in a single growing context; the main session plans, checks what they report and keeps its own context small. Use only when the user explicitly invokes it.
disable-model-invocation: true
argument-hint: "[the work to get done, how far to go, and anything worth knowing]"
---

# Orchestrate

This session orchestrates the work the user describes. Done task after task in one session, the context keeps growing: every turn rereads all of it, so each costs more than the last, and what is left over from unrelated tasks confuses the next one. So each task runs in a subagent, isolated in a fresh context that holds only what it needs, and this session decides and verifies.

The user says how far to go: a plan item, a milestone, everything that is left. If they didn't, ask before starting, since it shapes the whole plan. Until that point, keep going without checking in.

## Done when

- The work has reached the point the user set, or what is left is blocked on the user and they know it.
- Every change follows the project's instructions, including its checks and git rules.
- The branches and worktrees created along the way are merged and removed. One holding work that isn't merged is kept and named in the report, never deleted.
- The user has a short report: what was done, what was decided and why, what is left, and what needs them.

## What matters

- **This session's context stays small.** Everything it reads stays in it to the end and is reread on every turn after, so the isolation is only worth what this session keeps out of its own context. Code, diffs and logs belong in subagents, which report answers, not files. Keep the plan in notes outside the repo, so a summarized context can pick it back up.
- **Deciding is yours.** Subagents find things out and carry out decisions. One asked to assess and then fix has been handed yours. Product decisions are the user's, and subagents can't ask them, so settle what would change the result before it spreads into briefs.
- **A few at a time.** Independent tasks run in parallel, so hours of work don't become days. But every running subagent draws on the same usage limit: start too many at once and the limit runs out before any of them finishes, and half-done work is wasted. Run a few at a time, so those started can finish.
- **Balanced tasks.** Too big, and quality drops long before the subagent's context fills; an item of the project's plan is usually many tasks. Too small, and the fixed cost dominates: every subagent starts cold, rereads the instructions and rebuilds its context. A finished subagent's result shows its token use and tool calls: past roughly 100k tokens or 40 tool calls, the task was too big, whatever its result.
- **Reports are claims.** Mistakes come back as confident as results, and a subagent given your hypothesis tends to confirm it. Verify in proportion to the stakes, without reading the work yourself: run the project's checks, or have another subagent review the code without being told what to expect.
