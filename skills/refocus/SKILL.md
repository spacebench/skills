---
name: refocus
description: Re-audits a project's docs, agent instructions and tools against its real goal, to find and forget the rules that no longer serve it. Use only when the user explicitly invokes it.
disable-model-invocation: true
argument-hint: "[the project's goal]"
---

# Refocus

Projects maintained by agents accumulate rules, settling in layers like sediment. Each rule is added for a specific situation, the situation is forgotten, and the rule keeps the same authority as everything else. People forget naturally and keep reasoning from the goal. An agent reading the docs treats every line as current law.

The most damaging form of this is **goal displacement**: a means promoted to an end. A convenience introduced for one reason becomes a principle, later decisions are checked against it instead of against the project's purpose, and the project grows complexity to honor a rule nobody would defend if asked directly.

This skill finds those rules, so the user can decide to forget them. It removes things that work but no longer make sense, which is different from removing what is broken.

## The anchor comes from the user

Your understanding of the project comes from the very documents under audit, and judged by their own standard they pass. The way out is an anchor from outside: the goal, stated by the user. If the user didn't give it when invoking the skill, ask for it before reading any project file. A useful goal names the project's purpose, its consumer (a person, an agent, another system), one or two typical tasks the consumer performs with it, and optionally, for an unfinished project, the current milestone.

For the same reason, the first phase changes nothing. Your reading of the project is itself under audit. Your misreadings are findings, because every future agent will read the project the same way.

The audit covers docs, agent instruction files, skills, memory files, and tool definitions and interfaces. Read code to understand what tools actually do, not to audit it.

## The goal graph

The root is the goal. Intermediate goals serve it, such as "tools return results an agent can use without post-processing". The leaves are the concrete rules, conventions, tools, interface choices and design decisions found in the project. Every node justifies itself through an edge to a parent: "this exists because it serves that". The audit questions the edges, not the items. "Does this serve its parent?" can be answered where "is this aligned with the goal?" can't. It is a graph, not a tree: a leaf with several legitimate parents is safer to keep.

## Phase 1: diagnose, read-only

Before opening any project file, sketch what the project should need given the goal alone. It is a reference point to compare against, not a design. Then read the files in scope, and find why and when questionable rules were introduced.

Build the graph, and tag each node and edge **[stated]** when the documents say so, or **[inferred]** when you deduced it. Misunderstandings hide in the inferred ones. Then play the consumer through a typical task, with the project's actual tools and rules. Concrete use exposes absurdities faster than abstract reasoning.

Suspects come from what exists. In an unfinished project, parts of the sketch that aren't built yet are roadmap, not drift. Look for:

- **orphans**: nodes with no credible path to the root;
- **means turned into ends**: an intermediate goal that many leaves depend on, while its own edge to the root is weak. These are the most valuable findings, because forgetting one node releases many leaves;
- **workarounds**: complexity whose only job is to make a questionable premise work. Walk up from it to find the premise;
- **expired reasons**: a rule whose origin refers to a situation that no longer exists;
- **contradictions** between rules, or between a rule and the goal;
- **divergences from the sketch**: what the project has that the sketch didn't expect, or, in a finished project, what it lacks.

A justification that needs several "and it also helps with…" hops is a warning sign, not a justification.

For example, a rule says "functions must not exceed 20 lines", to keep code readable. Agents now split every non-trivial function into fragments spread across files, and following any logic means jumping between them. The rule has come loose from its parent: it is applied even where it makes code less readable, and the fragments are the workaround that gives it away. The question for the user is not "keep the 20-line rule?" but "is readability still the goal, and does this rule still serve it?"

Then report, and stop. Don't edit, and don't propose a fix for each item. The report, in chat unless the user's request says otherwise, gives:

- the goal as given, verbatim;
- your blind sketch;
- the graph as you read it, from root to leaves, with tags and the location of each leaf;
- the rules an agent here would actually follow, each with its source and the parent it serves;
- the suspects, each with its location, its chain up the graph, its kind, its origin if found, and the question it raises;
- where you may have misread;
- at most about ten questions, highest leverage first. Favor questions about intermediate goals, since one answer there settles many leaves.

Invite the user to correct the graph.

## Phase 2: correct and forget

This happens in the same session, so the reading stays in context. Rebuild the graph from the user's corrections and show it briefly. Then decide each affected leaf:

- **keep** it, if its edge is sound;
- **rewrite** it, if its content is sound but it is misplaced, misleading or missing its reason;
- **forget** it, if no sound edge remains.

Deleting is cheap, since version control keeps the history, so a rule with no sound edge needs no strong case against it. When a leaf's origin is unclear and its edge ambiguous, ask rather than decide. Where the user corrected your reading, rewrite the passage that misled you, or the next agent will misread it too. Changes to code or interfaces are a plan the user approves before you implement them.

Summarize the changes grouped by goal node, so the user can review them by intent rather than file by file. Then offer to keep the corrected upper graph, the root and intermediate goals, as a short goal map at the top of the project, with each new rule stating the parent it serves in a "because…" clause. Create it only if the user agrees.

## Boundaries

- Never commit. Changes stay in the working tree, and committing is the user's decision.
- Mention dead references or unused code only as evidence of drift.
- Don't refactor, restyle or reorganize beyond what the corrected graph requires.
