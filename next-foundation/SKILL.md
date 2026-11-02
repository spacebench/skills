---
name: next-foundation
description: Lays the foundation of a Next.js application — stack, local Postgres through PGlite, seed data, checks, continuous integration, browser access for the agent, and the stack's principles in AGENTS.md. Use only when the user explicitly invokes it.
disable-model-invocation: true
argument-hint: "[anything worth knowing about the app]"
---

# Next foundation

This lays the foundation of a Next.js application: a project that runs locally with no external service, with its checks, continuous integration, and the principles of this stack in `AGENTS.md`. Features come later.

What the user said when invoking it: $ARGUMENTS

Read `AGENTS.md` and `docs/` first. The principles below apply the general ones written there, and are added to them as applications, not restatements.

## Environment

- **Node and pnpm**, with their versions pinned where version managers and CI read them.
- **A browser you can drive.** Work isn't done until you have used the app the way its users will. In Claude Code, this is the Claude in Chrome extension. It drives the user's own browser, so tell them you could see what they are signed into there.

Settle with the user, up front, whatever only they can do, so the rest of the work needs no interruption.

## The stack

Next.js with the App Router, TypeScript in strict mode, pnpm and Tailwind CSS. Postgres through Drizzle. Zod for anything crossing a boundary. These libraries move fast, so use their current stable versions and check their documentation rather than your memory. Install only what the foundation needs: other libraries arrive with the feature that needs them. Hosting is decided later, so nothing ties the app to a host or provider.

**Database.** One Drizzle schema, with versioned migrations that are committed and never edited once applied. Locally, Postgres runs inside the Node process through PGlite, so a fresh clone needs only Node and pnpm. Only the database client knows which driver is in use. Given a regular Postgres connection string, it switches driver with no change anywhere else. A seed script fills the database with realistic data, and one command resets, migrates and seeds it. That gives the user a populated app at once, gives you realistic cases to test against, and makes a broken local state cheap to recover from. The seed follows the schema as it evolves.

**Configuration.** Environment variables are parsed with Zod in one module, so a missing one stops the app at startup with a clear message. An example env file documents each variable and where its value comes from.

**Email, later.** Nothing sends email yet, but record the choice in `AGENTS.md`. When a feature first needs email, it goes through Resend, from one small module the domain calls. Without a Resend key, emails are written to the console, so local work never needs an account.

**Look.** A small set of design tokens, named by role (surface, text, accent, danger…), lives in one place as Tailwind theme variables, and light and dark modes share it. That way the user can change the look by adjusting a few values. Don't hand-build complex components. When the app needs them, suggest a component library such as shadcn/ui, and let the user decide.

**Languages.** Which languages the interface speaks is a product decision, so ask early. If there is more than one, set up internationalization before any feature, because adding it later touches every string.

## Checks and continuous integration

The fast and full checks use Prettier (Markdown included, with EditorConfig), ESLint with typescript-eslint, and `tsc`. The full check adds Vitest for domain logic, against an in-memory PGlite migrated with the real migrations, then Playwright smoke tests of the main flows and the production build. ESLint warnings fail the check like errors. Write the tools, and what each check runs, into `AGENTS.md`.

A GitHub Actions workflow runs the full check on every push and pull request. It calls the same command as local work, so the two can't drift apart. It needs no secrets, since nothing external is involved, and it caches dependencies and Playwright browsers.

## Principles for AGENTS.md

**Continuous integration.** Every push runs the full check on a clean machine. A red run means the work isn't done, whatever passed locally, and fixing it comes first. Follow each run until it finishes. Neither the workflow nor the check is ever weakened to get a green run. The definition of done gains a green run on the pushed commit, and having used the app in the browser.

**Capabilities and interfaces in Next.js.** Data access is the only code that knows about Drizzle. Capabilities never import from Next.js. Server components and server actions are interfaces, as a CLI or a public API added later would be.

**Server actions, not internal APIs.** Server components get their data by calling domain functions, never by fetching the app's own HTTP endpoints. Every change of data the UI triggers goes through a server action. An action reads the session and the input, validates them, calls the domain, revalidates or redirects, and returns a typed result the UI can show, field errors included. Route handlers exist only for what truly needs an HTTP endpoint, such as webhooks, auth callbacks, or an API with a real external consumer.

**Everything is validated with Zod.** No data enters the system unparsed: action inputs, route and search parameters, request bodies, cookies and headers read for logic, environment variables, and responses from outside services. Domain functions validate their own inputs too, so they stay safe whatever calls them. Each schema is defined once. Types are inferred from it, and the same schema validates forms on the client when the UI needs instant feedback. A validation failure becomes a typed, user-facing error, never a silent default.

**Server first.** Render on the server by default. Client components exist only where the browser is needed, and they stay small and low in the tree.

**Types in TypeScript.** Strict mode stays on. `any`, non-null assertions and `as` casts are the escape hatches the general rule forbids. Types of external data are inferred from Zod schemas, never written twice.

## Done when

- A fresh clone runs with `pnpm install` and `pnpm dev`, and nothing else.
- The home page, rendered on the server, shows seeded data read through the domain layer. That proves the chain from schema to page. The reset command works.
- The full check passes, with at least one real unit test of a domain function and one Playwright smoke test. CI is green on the latest pushed commit.
- You have opened the app in the browser and seen it work.
- `AGENTS.md`, `docs/state.md` and the README (how to run the app and reset its data) reflect what now exists.

Tell the user what now exists.
