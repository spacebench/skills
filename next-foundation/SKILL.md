---
name: next-foundation
description: Lays the foundation of a Next.js application — the user's Node and browser setup, stack, local Postgres via PGlite, seed data, checks, continuous integration, and the stack's principles in AGENTS.md. Use only when the user explicitly invokes it.
disable-model-invocation: true
---

# Next foundation: lay the Next.js foundation

Read `AGENTS.md` and `docs/state.md` first. This skill fits on top of groundwork but does not require it: if either file is missing, create it, and wherever this skill relies on a general principle that is not written there (the definition of done, the fast and full checks, the product discussion), write that principle in too. This skill builds the foundation of a Next.js application: a project that runs, with its quality tooling, continuous integration and the principles specific to this stack.

## Everything the user has to do, first

Do all the setup that needs the user at the very beginning, in one guided session. Check what is already in place, walk the user through anything missing for their operating system, verify each item, and check current documentation rather than memory. Here is what must be in place:

- **Git and GitHub.** The project is a git repository with a GitHub remote, and the GitHub CLI is authenticated, because continuous integration runs there.
- **Node and pnpm.** If no Node version manager is installed, use fnm. It works the same on every operating system, reads the project's version file, and switches versions automatically. Pin the Node and pnpm versions in the standard files any version manager and CI read.
- **Browser access for you.** You need to see and use the app, because the user cannot verify your work for you. In Claude Code, the official way is the Claude in Chrome extension (Chrome or Edge). The user installs it, and the integration is enabled by default so it is there every session. Another agent uses the equivalent its environment provides. The extension drives the user's own browser, so tell them you could see what they are logged into there. In practice, you stay on the local app. Confirm it works by opening a page.
- **Permissions.** Extend the project's permission setup so the package manager, the project scripts and the browser run without asking each time.

Only once all of this is in place, start building.

## The stack

- **Framework:** Next.js with the App Router, TypeScript in strict mode, pnpm, Tailwind CSS.
- **Data:** Postgres through Drizzle. Zod for every schema that crosses a boundary.

Install only what this foundation needs. Libraries arrive with the feature that needs them.

These libraries move fast, so use their current stable versions and check their documentation rather than your memory of their APIs.

Hosting and production are decided later. Until then, avoid anything that ties the app to a specific host or provider.

The database is Postgres, with a single Drizzle schema. Locally, it runs on PGlite, which is Postgres running inside the Node process. A fresh clone needs nothing installed beyond Node and pnpm, and the PGlite data folder is git-ignored. The database client is the only place that knows which driver is in use. When a standard Postgres connection string is configured, the client should be able to switch to a regular Postgres driver without changes anywhere else.

Schema changes go through versioned migrations: generated, committed, and never edited once applied. A seed script fills the local database with realistic sample data, and one command wipes the database, migrates it and seeds it again. That command lets the user see a populated app immediately, lets you test against realistic cases, and makes a broken local state cheap to recover from. Keep the seed data in step with the schema as it evolves.

Environment variables are parsed with Zod in one module, so the app fails at startup with a clear message if one is missing. An example env file documents every variable and where its value comes from.

Nothing sends email at this stage. Write the choice for later into `AGENTS.md`, without installing anything. When a feature first needs to send email, it goes through Resend, from one small module the domain calls. When no Resend key is configured, emails are written to the console instead of failing, so local work never needs a Resend account.

Design tokens live in one place as Tailwind theme variables. The set is small and named by role (surface, text, accent, danger...) so the user can change the look by adjusting a few values with you. Light and dark modes use the same tokens. Do not hand-build complex presentational components. When the app needs them, suggest a component library (shadcn/ui by default) and let the user decide.

## Checks and continuous integration

These are the project's automated checks, which the definition of done in `AGENTS.md` refers to:

- **Formatting:** Prettier, Markdown included, with EditorConfig.
- **Linting:** ESLint with typescript-eslint.
- **Type checking:** a separate `tsc` pass.
- **Unit tests:** Vitest, focused on domain logic and run against an in-memory PGlite migrated with the real migrations.
- **End-to-end tests:** Playwright smoke tests covering the main user flows.
- **Build:** the production build.

These are the stack's tools for the fast and full checks described in `AGENTS.md`. The fast check applies Prettier to every file, Markdown included, then runs ESLint and `tsc`. The full check runs everything: formatting, linting, type checking, unit tests, end-to-end tests and the production build. It passes when formatting matches Prettier, ESLint reports no errors and no warnings, `tsc` reports no type errors, every unit and end-to-end test passes, and the production build succeeds. Write the tools and this precise meaning into `AGENTS.md`, as the application of the general rule about checks.

A GitHub Actions workflow runs on every push and every pull request. It installs dependencies from the lockfile with the pinned Node and pnpm versions, installs the browsers Playwright needs, and runs the full check. It calls the full check command rather than duplicating its steps, so local and CI checks cannot drift apart. The check needs no external service, so the workflow needs no secrets. Keep it fast by caching dependencies and Playwright browsers.

Add this principle to `AGENTS.md`, and extend the definition of done so that it includes a green CI run on the pushed commit:

**Continuous integration.** Every push runs the full check on GitHub Actions, on a clean machine. A red run means the work is not done, whatever passed locally, and fixing it comes first. After every push, follow the run with the GitHub CLI until it finishes. The workflow calls the full check command rather than duplicating it, and neither is ever weakened to get a green result.

## The principles of this stack

Add these to `AGENTS.md`, alongside the general principles already there. Some of them say how the general principles apply in this stack. Write them as that application, not as a restatement. The same rules apply: you may reword and tighten them, but keep every principle and its reasoning, and do not write a checklist.

**Capabilities and interfaces in Next.js.** Data access is the only code that knows about Drizzle. Capabilities never import from Next.js. Server components and server actions are interfaces, and so would be a CLI or a public API added later.

**Server actions, not internal APIs.** Server components get their data by calling domain functions directly, never by fetching the app's own HTTP endpoints. Every change of data the UI triggers goes through a server action: forms, buttons, any mutation. A server action is an interface like any other. It reads the session and the input, validates it, calls the domain, then revalidates or redirects, and returns a typed result the UI can show, including field errors. Route handlers exist only for what truly needs an HTTP endpoint, such as webhooks, auth callbacks, or a public API with a real external consumer.

**Everything is validated with Zod.** No data enters the system unparsed. That covers server action inputs and form data, route and search parameters, request bodies, cookies and headers read for logic, environment variables, and responses from third-party services. Domain functions validate their own inputs with Zod as well, so they stay safe whichever interface calls them. Each schema is defined once and is the single source of truth: TypeScript types are inferred from it, and the same schema serves client-side form validation when the UI needs instant feedback. Validation failures become typed, user-facing errors, never silent defaults.

**Server first.** Render on the server by default. Client components exist only where the browser is needed, and they stay small and low in the tree. A large client component wrapping much of a page deserves a second look.

**Types in TypeScript.** Strict mode stays on. `any`, non-null assertions (`!`) and `as` casts are the escape hatches the general rule forbids. Types of external data are inferred from Zod schemas, never written twice.

## Done when

- A fresh clone runs with `pnpm install` then `pnpm dev`, and nothing else.
- The home page renders on the server and shows seeded data read from the local database through the domain layer. This proves the chain from schema and migration to page.
- The reset-and-seed command works.
- The full check exists and passes. It includes one real unit test of a domain function against in-memory PGlite and one Playwright smoke test of the home page.
- Browser access works, and you have opened the app in a browser and seen it work.
- Env validation, the example env file, the pinned Node and pnpm versions and the initial design tokens are in place, and the page uses the tokens.
- `AGENTS.md` holds the stack principles and the precise meaning of the fast and full checks. `docs/state.md` is current and records that next-foundation has been applied. The README explains how to run the app and reset its data.
- Everything is committed and pushed, and the CI run on the latest commit has passed.

Finish by telling the user, in plain words, what now exists. If the app needs user accounts, the next-accounts skill adds them. Otherwise, the next move is the product discussion described in `AGENTS.md`.
