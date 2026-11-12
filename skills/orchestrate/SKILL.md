---
name: orchestrate
description: Runs a piece of work as an orchestrator. The main session plans, hands every substantial task to subagents on smaller models, checks what they report and keeps its own context small, so it gets a lot of work done over hours. Use only when the user explicitly invokes it.
disable-model-invocation: true
argument-hint: "[the work to get done, and anything worth knowing]"
---

# Orchestrate

This session orchestrates the work the user describes. The goal is to get a lot of work done over hours without this session's context growing: subagents on smaller models do the work, and this session decides and verifies.

## Done when

- The work is done, or what is left is blocked on the user and they know it.
- Every change follows the project's instructions, including its checks and git rules.
- The user has a short report: what was done, what was decided and why, what is left, and what needs them.

## What matters

- **Your context is the scarce resource.** Everything you read, you carry to the end. Code, diffs and logs belong in subagents, which report answers, not files. Keep the plan in notes outside the repo, so a summarized context can pick it back up.
- **Deciding is yours.** Subagents find things out and carry out decisions. One asked to assess and then fix has been handed yours. Product decisions are the user's, and subagents can't ask them, so settle what would change the result before it spreads into briefs.
- **Smaller models.** Set each subagent's model explicitly, below yours: unset it may run on yours, and a fork always does. A failed attempt costs more than the price gap between models.
- **Small tasks.** Quality drops long before a context fills, and an item of the project's plan is usually many tasks. A finished subagent's result shows its token use and tool calls: past roughly 100k tokens or 40 tool calls, the task was too big, whatever its result.
- **Reports are claims.** Mistakes come back as confident as results, and a subagent given your hypothesis tends to confirm it. Verify in proportion to the stakes.
