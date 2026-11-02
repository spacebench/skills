---
name: refocus
description: Re-audit a project's docs, agent instructions and tools against its real goal, to find and forget the rules that no longer serve it. Use only when the user explicitly invokes it.
disable-model-invocation: true
argument-hint: "[restated goal]"
---

# Refocus

Agent-maintained projects accumulate rules, and they settle in layers like sediment. Each one is added in response to a specific situation, the situation is forgotten, and the rule stays with the same authority as everything else. Humans forget naturally and keep reasoning from the goal; an agent reading the docs treats every line as current law.

The most damaging form of this is **goal displacement**: a means gets promoted to an end. A convenience introduced for one reason becomes a principle, and later decisions are checked against that principle instead of against the project's purpose. The project then grows complexity to honor a rule nobody would defend if asked directly.

This skill exists to find those rules and let the user decide to forget them. It is different from cleanup. Cleanup removes things that are broken (dead references, unused code). Refocus removes things that work but no longer make sense.

## Why the goal must come from the user

The agent's understanding of the project comes from the very documents it is auditing. If it judges the docs by what the docs say, it will approve almost everything. The only way out of this loop is an anchor from outside: the goal, stated by the user at invocation time.

For the same reason, the first pass never edits anything. The agent's reading of the project is itself what's being audited. Some of its conclusions will be misreadings. Those misreadings are valuable findings, because every future agent will read the project the same way. They are not something to act on before the user has checked them.

## Inputs

1. **The goal statement:** `$ARGUMENTS` if provided. Otherwise, ask for it before reading any project file. A useful goal statement names:
   - the purpose of the project, in one or two sentences
   - the consumer: who or what uses it (a person, an agent, another system)
   - one or two typical tasks the consumer performs with it
   - for an unfinished project, optionally the current milestone, so the sketch is scoped to where the project should be now
2. **The scope.** By default, this covers documentation, agent instruction files, skills, memory files, and tool definitions and interfaces. Read code to understand what tools actually do, but don't audit it line by line.

## The goal graph

Represent the project as a graph of goals:

- **Root:** the goal as stated by the user.
- **Intermediate goals:** sub-goals that serve the root (e.g. "tools return results an agent can use without post-processing").
- **Leaves:** concrete rules, conventions, tools, interface choices and design decisions found in the project.

Every node must justify itself through an edge to a parent: "this exists because it serves that." The audit questions edges, not items. "Does this node actually serve its parent?" is a far more answerable question than "is this aligned with the goal?"

It is a graph, not a strict tree. A leaf may serve several parents, and multiple legitimate parents make it safer to keep.

## Phase 1 — Diagnose (read-only)

Do not modify any file during this phase.

### Step 1: Blind sketch

Before opening any project file, sketch what the project _should_ need given the goal alone: the intermediate goals you'd expect, the kinds of tools and rules a consumer would need for the typical tasks, and what you'd expect to be absent. Keep it short. It is a reference point to diff against, not a design.

### Step 2: Read

Read the in-scope files. For rules and design decisions that look questionable, check their origin in version control (`git log`, `git blame`, commit messages) to recover why they were introduced and when.

### Step 3: Build the graph

Connect the upper levels (from the goal statement and the blind sketch) to the leaves (from the documents). Attach each leaf to the parent it claims to serve. Mark each node and edge as:

- **\[stated\]** — the documents say so explicitly
- **\[inferred\]** — you deduced it

Inferred nodes are where misunderstandings hide.

### Step 4: Walk through as the consumer

Roleplay the consumer performing a typical task using the project's actual tools and following its actual rules. For example: "I am the agent, I have this input, I call this tool with…" Concrete use exposes absurdities faster than abstract reasoning.

### Step 5: Identify suspects

Suspects come from what exists. In an unfinished project, the blind sketch will describe pieces that aren't built yet. Report those absences only as context: they are roadmap, not drift.

Look for:

- **Orphans:** leaves or intermediate goals with no credible path to the root.
- **Means turned into ends:** an intermediate goal that many leaves depend on, while its own edge to the root is weak. These are the highest-value findings, because forgetting one node releases many leaves.
- **Workarounds:** complexity whose only job is to make a questionable premise work. Treat a workaround as a symptom: walk up from it to find the premise.
- **Expired reasons:** the origin of a rule (from git history or the docs) refers to a situation that no longer exists.
- **Contradictions:** between rules, or between a rule and the goal.
- **Divergences from the blind sketch:** things the project has that the sketch didn't expect, or (in a finished project) lacks that it did.

If justifying a node takes several "and it also helps with…" hops, treat that as a warning sign, not a justification.

**Illustration.** A project's instructions say "functions must not exceed 20 lines." The rule was added to keep the code readable. Months later, agents working on the project faithfully split every non-trivial function into fragments: `process_part1`, `process_part2` and `_process_helper` scattered across files. Each fragment is short, but following any piece of logic now means jumping across five places.

The graph makes the drift visible. The intended chain was "short functions → readable code → maintainable project." The rule has detached from its parent: it is now applied even where it makes code _less_ readable, so the edge to "readable code" no longer holds. The fragment functions are the workaround that gives it away: complexity whose only job is to satisfy the rule. The question for the user is not "should we keep the 20-line rule?" but "is readability still the goal, and does this rule still serve it?"

### Step 6: Report, then stop

Write the report using the template below and stop. Don't edit and don't offer a fix for each item. Invite the user to correct the graph.

```markdown
# Refocus report — <project name>

## Goal as given

<the user's goal statement, verbatim>

## Blind sketch

<what the project should need, written before reading it>

## The goal graph as I read it

<indented list from root to leaves; each node tagged [stated] or [inferred];
leaves include their location (file, section, tool name)>

## Effective rules

<what an agent working in this project would actually do, as a result of the
current documents — each with its source and the parent goal it serves>

## Suspects

<for each: the item and its location, its chain up the graph, why it is
suspect (orphan / means-to-end / workaround / expired reason / contradiction /
divergence), its origin from history if found, and the question it raises>

## Where I may have misread

<the inferred nodes and edges you are least confident about>

## Questions

<at most ~10, highest leverage first — favour questions about intermediate
goals, since one answer there settles many leaves>
```

## Phase 2 — Correct and forget

Run this phase in the same session as Phase 1, so the full reading stays in context.

1. **Rebuild the graph** from the user's corrections and show the corrected version briefly.
2. **Decide each affected leaf** against the corrected graph:
   - **keep:** the edge is sound
   - **rewrite:** the content is sound, but it's misplaced or misleading, or it lacks its reason
   - **forget:** no sound edge remains
3. **Fix the sources of misreadings.** When the user corrected one of your interpretations, find the passage that led you there and rewrite it. Otherwise the next agent will make the same mistake.
4. **Treat code and interface changes separately.** If forgetting a goal implies changing tools or interfaces (e.g. merging fragmented functions back, or changing a tool's signature), present them as a plan and implement only what the user approves.
5. **Summarize the changes**, grouped by the goal node they relate to, so the user can review them by intent rather than file by file.
6. **Offer a goal map.** Propose keeping the corrected upper graph (root and intermediate goals only) as a short document at the top of the project. New rules should then state the parent they serve in a brief "because…" clause. Create it only if the user agrees.

Deleting is cheap because version control keeps the history, so a rule with no sound edge doesn't need a strong case against it to go. When a leaf's origin is unclear _and_ its edge is ambiguous, ask rather than decide.

## Boundaries

- **Never commit.** Leave all changes uncommitted. The user decides whether and when to commit.
- **Stay out of cleanup.** Mention a dead reference or unused code only when it is evidence of drift (e.g. a rule still pointing to a tool that was removed when its goal was abandoned).
- **Keep the scope.** Don't refactor, restyle or reorganize documents beyond what the corrected graph requires.
