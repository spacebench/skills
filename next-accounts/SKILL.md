---
name: next-accounts
description: Adds user accounts, workspaces and permissions to a Next.js app, with team features built if the user wants them and always ready to turn on later. It covers Better Auth, a private dashboard, roles, optional team membership and invitations, permission checks in the domain, and the GDPR foundations (data register, export, deletion), all working locally. Use only when the user explicitly invokes it.
disable-model-invocation: true
---

# Next accounts: accounts, workspaces and permissions

Read `AGENTS.md` and `docs/state.md` first, along with anything else in `docs/` that bears on this work. This skill expects the following stack and conventions: Drizzle on Postgres with versioned migrations and a reset-and-seed command, Zod at every boundary, server actions for every mutation, Vitest and Playwright in the full check, and CI on GitHub Actions. Where the project already does one of these differently, use its equivalent. Where one is missing, set it up first.

This skill gives the app user accounts, workspaces ready for teams, a permission model, and the privacy foundations every later feature builds on, all working locally.

## Teams: the user's choice, always ready

Before starting, ask the user whether people will work together in the app, or whether every user only ever sees their own data. That decides whether the team features are built now. It does not decide the shape of the code. The app is always ready for teams, so turning them on later is a feature to add, not a redesign:

- **Data belongs to workspaces.** Every user has a personal workspace, created with their account. A team is simply a workspace with several members. Data is owned by a workspace, never directly by a user.
- **One identity shape.** The caller identity always carries the user, their active workspace and their role in it.
- **Permissions stay the same.** Permissions are checked against the workspace and the role, so they work unchanged whether a workspace has one member or many.

Without teams, the personal workspace stays invisible. Users never see the word, cannot create other workspaces, and nothing about invitations or members is built. With teams, the features below are built on the same model. Either way, record the choice in `docs/state.md`, and describe in `docs/` what turning teams on later involves.

## What to build

A visitor can create an account, sign in, reach a private dashboard, and sign out. The dashboard is protected, so signed-out visitors are sent to sign-in. From the dashboard, users can see and correct their profile, download all their data, and delete their account.

With teams, a user can also do the following:

- create a team and become its owner;
- invite people by email;
- accept an invitation;
- belong to several teams and switch between them;
- leave a team.

Team owners and admins manage members and their roles.

## Authentication

Authentication uses Better Auth, with its tables in our own schema and migrations through its Drizzle adapter. If Better Auth offers a plugin for organizations or teams, prefer it over building membership from scratch, after checking its current documentation. Better Auth stays at the edge of the app:

- its tables hold what authentication and membership need and nothing more;
- the app's own data (profiles, preferences, anything product-specific) lives in our own tables, referencing users and workspaces by ID;
- the domain depends on a caller identity type it owns, holding the user, their active workspace and their role, never on Better Auth's types. Interfaces translate the session into that identity.

The forms follow the project conventions like any other feature: server actions validated with Zod, with typed errors shown to the user. Do not set up a separate client-side flow just because the library offers one.

Sign-in at this stage is email and password, so the app can be tested with no external account. Password sign-in is a development convenience, not the app's real sign-in method:

- it sits behind an explicit development-only flag;
- it must be impossible to switch on outside development, and a test proves it;
- because passwords never reach real users, there is no password reset and no email verification. Do not build them.

The real methods, OAuth providers starting with Google, come with production. Set auth up so that adding them later is configuration, not a redesign.

## Email

Invitations are the first emails the app sends. If the app has no email module yet, build it now: one small module the domain calls, sending through Resend, which writes emails to the console instead when no Resend key is configured. The invitation link must be copyable from the console output, so local work never needs a Resend account.

## Permissions

The permission model is defined once, in the domain, and every capability asks it before acting.

Permissions are expressed as actions on resources, such as "update this project" or "invite a member to this team". Roles are only named bundles of those permissions. Start with the roles most apps need: owner, admin and member. Keep the mapping from roles to permissions in one place, so adding a role or changing what a role can do touches nothing else.

Every capability that touches protected data takes the caller identity and checks permission itself, whichever interface calls it. Do not rely on a page being protected, a button being hidden, or a link not being shown. The interface may hide what the caller cannot do, but only as a convenience for the user, never as the protection.

Data is owned by a workspace: the user's personal one or a team. Each feature decides, with the product, which workspace its data lives in. A user sees the data of the workspaces they belong to, and nothing else, unless the product explicitly says otherwise.

Write the permission model into `AGENTS.md` in a few lines: permissions are actions on resources, roles map to them in one place, and checks live in the domain. Describe how it works in `docs/`, with a pointer from `AGENTS.md`.

## GDPR foundations

The app will likely serve people in the European Union, so it follows the GDPR from the first piece of personal data. This skill builds the mechanisms once, so that later features only have to plug into them.

**A register of personal data.** `docs/privacy.md` lists every piece of personal data the app stores: what it is, why it is needed, where it lives, how long it is kept, and which outside services ever see it, Resend included. It is the source for the privacy policy written for production. Collect only what a feature actually needs.

**Export and deletion that cover everything.** The domain offers two capabilities: export all of a user's data in a readable, machine-usable format, and delete a user with everything they own. Each table that references a user or a workspace registers how it is exported and deleted. A test inspects the schema and fails if any such table is not covered. This makes "a new feature forgot about the GDPR" a failing check, not something to remember. Deletion removes the auth records, memberships and the personal workspace with its data too, and afterwards the person can no longer sign in.

Teams need one extra rule. A user who is the only owner of a team cannot simply vanish. They first transfer ownership, or confirm that the team and its data are deleted with them.

**Correction.** Users can view and correct their own profile data from the dashboard.

**No consent banner needed so far.** The app sets only the cookies strictly needed for it to work, such as the session, so it needs no consent banner. Adding analytics, tracking or any non-essential cookie later is a product decision that brings consent with it. Raise it with the user when it comes up.

**Personal data stays out of logs and error messages.**

Write the privacy rule into `AGENTS.md` in a few lines: ownership and permissions are enforced in the domain, and every table referencing a user or a workspace plugs into export and deletion. Describe how the mechanisms work in `docs/privacy.md`, alongside the register. Legal pages, the choice of hosting region, and agreements with outside services belong to production.

## Seed data

The seed data gains several users, each with data in their personal workspace. With teams, it also has several teams, users with different roles, and some users who belong to more than one team, each team with its own data. That way permissions can be tested and seen. The README lists the seeded accounts with their emails, passwords and roles, so the user can sign in as any of them.

## Done when

- Sign-up, sign-in, dashboard, profile correction, data export, account deletion and sign-out work locally, with no external account or service.
- With teams: creating a team, inviting through the console email, accepting, switching teams, changing roles and leaving all work, and the sole-owner rule holds on deletion.
- A test proves that password sign-in cannot be enabled outside development.
- Tests prove that a user cannot read or modify data outside the workspaces they belong to, that each role can do exactly what the role mapping allows, and that a signed-out visitor cannot reach the dashboard.
- The schema coverage test for export and deletion exists and passes, and deleting a seeded user leaves nothing of theirs behind.
- `docs/privacy.md` describes all personal data stored so far.
- Playwright smoke tests cover the account flows and, with teams, the invitation flow.
- You have gone through these flows yourself in a browser, as seeded users with different roles.
- The example env file documents every new variable, and the README lists the seeded accounts.
- The full check passes. `AGENTS.md` and `docs/state.md` reflect anything new and lasting, and `docs/state.md` records that next-accounts has been applied, with or without teams. Everything is committed and pushed, and the CI run on that commit has passed.

Finish by telling the user what they can now do with the app. Then, unless it has already happened, open the product discussion described in `AGENTS.md`.
