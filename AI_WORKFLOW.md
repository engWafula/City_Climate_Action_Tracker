# AI Workflow

I used Codex as my  AI coding partner inside the local repo. My workflow was intentionally iterative: ask Codex to inspect the existing files first, make a small scoped change, run verification commands, then review the diff before moving to the next feature. I used shell commands, TypeScript, ESLint, Vitest, and production builds as the guardrails around AI-generated code.

## Tools and Workflow

- **Tool used:** Codex, with local terminal access for file inspection, edits, dependency installation, Docker checks, and verification.
- **General workflow:** I broke the project into slices: data model, public dashboard, admin CRUD, AI import, authentication, multi-city support, Docker setup, and UX polish.
- **Context strategy:** Before each major change, I had Codex read the relevant source files instead of prompting from memory. For example, before changing auth it inspected `lib/auth.ts`, `app/actions/auth-actions.ts`, `components/login-form.tsx`, and `prisma/schema.prisma`.
- **Verification loop:** After changes I ran `npm run lint`, `npm run test`, `npx tsc --noEmit`, `npm run build`.

## Where AI Saved Significant Time

The biggest time saver was the initial project setup and folder structure. A representative prompt was to scaffold a Next.js + TypeScript app with Prisma, PostgreSQL, Docker Compose, Tailwind CSS, and a clean separation between `app`, `components`, `lib`, `prisma`, and `tests`. Codex helped create the boilerplate structure, config files, initial Prisma schema shape, seed script skeleton, shared UI primitive files, and test harness. That saved time on setup, while the actual product behavior was still built through smaller reviewed iterations.

Another major time saver was implementing and iterating on cross-cutting admin workflows. A representative prompt was: “Add multi-city management in the best way for this app: public users should switch cities, admins should add/edit cities, and actions should be scoped to the selected city.”

Codex traced the existing single-city flow that I had initially, then generated the city repository methods, server actions, admin city workspace, public city selector, and URL-based `cityId` routing. That was valuable because the change touched several layers: Prisma-backed queries, server actions, server-rendered pages, and client UI. AI helped keep the naming and data flow consistent while I focused on product decisions like making city selection a dropdown so it scales when many cities are added.

## Where I Overrode or Corrected AI

I corrected the AI several times when the first implementation was too complex or not aligned with the product intent:

- **Auth design:** Codex first implemented custom JWT access and refresh cookies. I accepted the direction briefly, then reconsidered and switched to NextAuth/Auth.js because it is a more standard and explainable production pattern for a Next.js App Router app. The final version centralizes auth in `auth.ts`, uses a credentials provider backed by the existing `User` table, and exposes `auth()`, `signIn()`, and `signOut()` through the official pattern.
- **Refresh-token storage:** An earlier AI suggestion added a database `RefreshToken` model. I removed it because it was overbuilt for this case study and introduced extra schema churn. When the direction changed to NextAuth, I removed the custom token system entirely.
- **UX details:** AI initially made city selection as a row of pills and action start year as a normal number input. I changed city selection to dropdowns for scalability and changed start year to a controlled year selector so users cannot enter arbitrary values.


## How I Structured the Session

I treated Codex like a fast pair programmer, not an autopilot. I gave it the project goal and then decomposed the work into small reviewable tasks. For each task I asked it to gather context from the repo, implement, and verify. I also asked direct follow-up questions when the product behavior was unclear, such as whether projected emissions should count only active actions or all entered actions. That led to a clearer calculation: the projection chart uses all entered actions from their start year, while simple dashboard metrics stay easy to explain.

The main judgment I applied was keeping the app understandable. I preferred conservative architecture over clever abstractions: Prisma for persistence, Zod at input boundaries, server actions for mutations, isolated calculation helpers, a deterministic fallback for AI import, and focused UI components. The AI accelerated the implementation, but I made the final calls on security tradeoffs, UX simplification, Docker ergonomics, and what to remove when a feature no longer matched the product.
