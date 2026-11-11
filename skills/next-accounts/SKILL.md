---
name: next-accounts
description: Adds user accounts, workspaces and permissions to a Next.js app, with team features built now or ready to turn on later. It covers Better Auth, a private dashboard, roles, optional teams and invitations, permission checks in the domain, and the GDPR foundations (data register, export, deletion), all working locally. Use only when the user explicitly invokes it.
disable-model-invocation: true
argument-hint: "[teams or not, and anything worth knowing]"
---

# Next accounts

This gives a Next.js app user accounts, workspaces, a permission model, and the privacy foundations every later feature plugs into, all working locally with no external service.

This skill assumes a Next.js app on Drizzle and Postgres, with Zod at its boundaries, server actions for changes of data, and unit and end-to-end tests in the full check. Where the project does something differently, follow the project.

## Teams

Whether people work together in the app, or each user only ever sees their own data, is a product decision: ask, unless the context already says. It decides whether team features are built now, not the shape of the code. The app is always ready for teams, so turning them on later is a feature to add, not a redesign:

- **Data belongs to workspaces**, never directly to users. Every user has a personal workspace, created with their account, and a team is simply a workspace with several members.
- **The caller identity** always carries the user, their active workspace and their role in it.
- **Permissions** are checked against the workspace and the role, so they work unchanged whether a workspace has one member or many.

Without teams, the personal workspace stays invisible, and nothing about members or invitations is built. Either way, record the choice in `docs/`, along with what turning teams on involves.

## What users can do

Create an account, sign in, reach a private dashboard and sign out. From the dashboard: see and correct their profile, download all their data, and delete their account. With teams, they can also create a team and own it, invite people by email, accept an invitation, belong to several teams and switch between them, and leave a team. Owners and admins manage members and their roles.

## Authentication

Better Auth, with its tables in our schema through its Drizzle adapter. If its organization plugin fits the workspace model, prefer it to building membership by hand. Check its current documentation first. Better Auth stays at the edge of the app. Its tables hold only what authentication and membership need, and the app's own data lives in our tables, referencing users and workspaces by ID. The domain depends on a caller identity type of its own, never on Better Auth's types, and interfaces translate the session into it. The forms follow the project's conventions, not a client-side flow just because the library offers one.

Sign-in is by email and password for now, so the app runs with no external account. That is a development convenience, not the real sign-in method. It sits behind a development-only flag that cannot be switched on anywhere else, and a test proves it. There is no password reset and no email verification, since no real user will ever have a password. The real methods, OAuth starting with Google, come with production, so set things up for adding them to be configuration, not a redesign.

## Email

Invitations are the app's first emails. If it has no email module yet, add one: a small module the domain calls, sending through Resend, which writes emails to the console when no Resend key is configured. Invitation links can then be copied from the console during local work.

## Permissions

The permission model is defined once, in the domain. Permissions are actions on resources, such as "update this project" or "invite a member to this team". Roles are named bundles of permissions, starting with owner, admin and member, mapped in one place, so changing what a role can do touches nothing else.

Every capability that touches protected data takes the caller identity and checks permission itself, whatever interface calls it. A protected page or a hidden button is a convenience for the user, never the protection. A user sees the data of the workspaces they belong to and nothing else, unless the product says otherwise. Each feature decides, with the user, which workspace its data lives in.

Write the model into `AGENTS.md` in a few lines, and describe how it works in `docs/`.

## Privacy

The app follows the GDPR from the first piece of personal data: it is the most demanding common baseline, and adding it later is costly. The mechanisms are built once, so later features only plug into them.

- **A register.** `docs/privacy.md` lists every piece of personal data the app stores: what it is, why it is needed, where it lives, how long it is kept, and which outside services see it. The privacy policy will be written from it. Collect only what a feature needs.
- **Export and deletion that cover everything.** The domain can export all of a user's data in a readable, machine-usable format, and delete a user with everything they own: auth records, memberships, and the personal workspace with its data. Afterwards, the person can no longer sign in. Every table referencing a user or a workspace registers how it is exported and deleted, and a test that inspects the schema fails if one doesn't. A new feature that forgets the GDPR is then a failing check, not something to remember. A user who is the only owner of a team first transfers ownership, or confirms that the team is deleted with them.
- **Correction.** Users correct their own profile data from the dashboard.
- **No consent banner** while the app sets only strictly necessary cookies, such as the session. Analytics or tracking would bring consent with them, so raise it with the user when it comes up.
- **Personal data stays out of logs and error messages.**

Write the privacy rule into `AGENTS.md` in a few lines, and describe the mechanisms in `docs/privacy.md`, next to the register. Legal pages, the hosting region and agreements with outside services belong to production.

## Seed data

Several users, each with data in their personal workspace. With teams, add several teams, users with different roles, and some users in more than one team, so that permissions can be tested and seen. The README lists the seeded accounts, with their emails, passwords and roles.

## Done when

- Every flow above works locally, and you have gone through them in the browser as seeded users with different roles.
- Tests prove that:
  - password sign-in can't be enabled outside development;
  - no user can read or change data outside their workspaces;
  - each role can do exactly what the mapping allows;
  - a signed-out visitor can't reach the dashboard;
  - deleting a seeded user leaves nothing of theirs behind, and the schema coverage test passes.
- Playwright covers the account flows and, with teams, the invitation flow.
- `docs/privacy.md` covers all personal data stored so far. The example env file and the README are current.
- The full check passes and CI is green on the pushed commit. `AGENTS.md` and `docs/` reflect what is new, including whether teams are on.

Tell the user what they can now do with the app.
