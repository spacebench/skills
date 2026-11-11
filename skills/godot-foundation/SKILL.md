---
name: godot-foundation
description: Lays the foundation of a Godot game in C# — a game-rules library independent of the engine, fixture states, a debug launch the agent uses to see the game, checks, continuous integration, and the stack's principles in AGENTS.md. Use only when the user explicitly invokes it.
disable-model-invocation: true
argument-hint: "[the game, and anything worth knowing]"
---

# Godot foundation

This lays the foundation of a Godot game written in C#: a project that opens and runs from a fresh clone, with the game's rules apart from the engine, its checks, continuous integration, and the principles of this stack in `AGENTS.md`. Gameplay comes later.

The principles below apply the general ones in `AGENTS.md`, and are added to it as applications, not restatements.

## Environment

- **Few tools.** Every tool is something a contributor installs and CI downloads, so the project needs only the .NET SDK, the .NET edition of Godot with its export templates, and dprint for Markdown. Project scripts, such as the checks, are C# run with `dotnet run`, so they work on every operating system with nothing more.
- **Pinned versions.** Godot has no installer, so put it where the checks find it, and show the user how to open the editor. Pin each version where local work and CI both read it, and have the checks verify the versions they find, so a mismatch stops them with a clear message rather than a strange failure.
- **A way to see the game**, so you can see what you change running. You can't play it the way a person does, so the game gives you the means: a debug launch, through command-line arguments, that starts it in a given state, plays scripted input, saves screenshots at chosen moments, and quits. What you can't judge, such as how controls feel or whether timing is right, belongs to the user: tell them precisely what to playtest.

Settle with the user, up front, whatever only they can do, so the rest of the work needs no interruption.

## The stack

The current stable Godot 4 with C#, in nullable-enabled C# with warnings treated as errors. Godot and .NET move fast, so check their current documentation rather than your memory, notably for command-line flags. Install only what the foundation needs: no addons, and no other library until a feature needs it.

**Projects.** A solution holds three projects: the Godot game, a class library for the game's rules that does not reference Godot, and an xUnit project testing that library. The missing reference is what keeps the rules independent of the engine: the compiler enforces it.

**Saves and settings.** A data access layer is the only code that knows where saves, settings and content files live and in what format. Save files carry a format version. When the format changes, a migration reads the older version, and a migration is never edited once released, since players hold saves in every past format.

**Fixture states.** A set of named game states, such as a fresh start, a mid-game save or a near-death fight, is built from the domain and launched by name from the command line. That lets the user jump straight to what they want to try, gives you realistic cases to test and look at, and makes reproducing a bug cheap. One command clears local saves and settings. The fixtures follow the game as it evolves.

**Configuration.** Command-line arguments and settings are parsed in one place at startup, so an unknown argument or an invalid value stops the game with a clear message.

**Look.** A Godot `Theme` holds a small set of colors and fonts, named by role (surface, text, accent, danger…), so the user can change the look of the interface by adjusting a few values. Placeholder art is plainly placeholder. Don't hand-build art or complex interface elements. When the game needs them, suggest asset sources or tools, and let the user decide.

## Checks and continuous integration

The fast check applies `dotnet format`, formats Markdown and the configuration files with dprint, a single binary with no runtime, and builds the solution. The analyzers in the build are the linter, and the compiler with nullable reference types is the type checker. Files the Godot editor writes, such as scenes and resources, are left to it. The full check verifies formatting instead of applying it, then runs the xUnit tests, then the smoke tests: Godot runs headless, loads every scene once so a broken reference fails the check, and plays each fixture state through scripted input, asserting on the resulting state and failing with a non-zero exit code. Finally it exports a build for the platform CI runs on, so a change that breaks exporting is caught. Write the tools, and what each check runs, into `AGENTS.md`.

A GitHub Actions workflow runs the full check on every push and pull request. It calls the same command as local work, so the two can't drift apart. It needs no secrets, reads the pinned versions, and caches NuGet packages, Godot and its export templates.

## Principles for AGENTS.md

**Continuous integration.** Every push runs the full check on a clean machine. A red run means the work isn't done, whatever passed locally, and fixing it comes first. Follow each run until it finishes. Neither the workflow nor the check is ever weakened to get a green run.

**Capabilities and interfaces in Godot.** The rules library holds the game: its state, its rules and its decisions. Nodes are the interface. They read input, call the domain, and show its state, and Godot signals stay on the node side. The engine keeps what it does well, such as physics, animation, rendering and audio, and the domain decides what happens as a result. The domain receives elapsed time and randomness as arguments, a seeded random source for the latter, so it is deterministic and a test can replay any situation. The test: could a console program play the game's rules without Godot?

**Any platform, any language.** Platforms and languages are interfaces too, so the game is written as if it already shipped on several of each, and adding one never touches the rest. Input goes through the input map's actions, never physical keys or buttons, so keyboard, gamepad and touch bind to the same actions. Layouts anchor and scale to any screen size and aspect ratio. Saves and settings live under `user://`. Anything only some platforms have, such as a store or an achievement service, sits behind a small interface, with an implementation that does nothing on platforms without it. Every player-facing string goes through Godot's translation system with its source text as the key, sentences use placeholders rather than pieces joined together, and counts use plural forms. Adding a language is then a translation file and a check that fonts and layouts still fit.

**Scenes for structure, code for behavior.** Node trees are built in scenes, not in code, so the user can open and change them in the editor. Values someone will want to tune, such as speeds, timings and costs, are exported properties or resources, never constants buried in code, so the user can tune the game without touching code. When you edit scene or resource files as text, keep their IDs intact, and have Godot import the project headless afterwards to confirm it still loads.

**Types in Godot C#.** Nullable reference types and warnings as errors stay on. The null-forgiving operator, `null!` initializers and unchecked casts are the escape hatches the general rule forbids. A node reference or an exported field really is absent until the scene is ready, so its field is nullable, and code reaches it through an accessor that throws a clear error naming the node and the field. `_Ready` reads each one, so a broken scene fails when it loads, not in the middle of play. A `Variant` is converted to a real type where it enters C# code.

**Everything from outside is validated.** Save files, settings, content files and command-line arguments are parsed and validated when they are read. A corrupt or outdated save becomes a typed error the game can show the player, never a crash or a silent default. Domain functions validate their own inputs too, so they stay safe whatever calls them.

## Done when

- A fresh clone, with the pinned .NET and Godot installed, opens in the editor and runs, and each check is one command.
- The main scene shows state that comes from the rules library, which proves the chain from domain to screen. A fixture state launches by name from the command line, and the reset command works.
- The full check passes, with at least one real unit test of a domain function and one headless smoke test. CI is green on the latest pushed commit.
- You have run the game through the debug launch and looked at its screenshots, and told the user what to playtest.
- `AGENTS.md`, `docs/` and the README (how to run the game, launch a fixture state, and reset local data) reflect what now exists.

Tell the user what now exists.
