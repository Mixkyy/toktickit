# AI Use and Reflection (Lab 4)

**LLM Used:** Google Deepmind's Antigravity (Advanced Agentic Coding)

## Key Prompts Used:

1. *"Review the Lab 4 sheet and prepare the engineering contract for Actions Taken, dashboards, and ticket workflow."*
   - Generated initial `specification.md`, `api-spec.md`, `ui-spec.md`, and `tests.md` aligned with Sprint 4 requirements.
2. *"Implement the Actions Taken foundation model in Prisma schema with version optimistic locking, migration, idempotent seed, and REST endpoints."*
   - Created `ActionTaken` model, migration SQL, seed data with 0, 1, and multi-action tickets, and `/api/tickets/:id/actions` routes.
3. *"Implement the ActionsTaken UI component in TicketDetail with edit mode, follow-up validation, and requester read-only view."*
   - Built `ActionsTakenSection.tsx` matching Zen Green aesthetic (#006B3C / #0B7A46) and integrated into `TicketDetail.tsx`.
4. *"Enforce the backend status transition matrix, resolution gate, 409 Conflict optimistic concurrency, and conflict banner."*
   - Added `PERMITTED_STATUS_TRANSITIONS`, resolution review restriction on requesters, version verification, and interactive UI refresh banner.
5. *"Implement Requester and IT Staff/Admin dashboards with backend DB aggregation queries, Zen Green metric cards, and recent tickets."*
   - Created `/api/dashboards/requester` and `/api/dashboards/staff`, `RequesterDashboard.tsx`, `StaffDashboard.tsx`, and updated `App.tsx` role routing.
6. *"Write a short, concise approval comment for my peer's PR like last time."*
   - Assisted in peer review communication, providing concise, professional approval comments reflecting technical deliverables.

---

## My Reflection

Sprint 4 introduced complex enterprise service desk workflows: optimistic concurrency control, strict state-machine transition rules, multi-staff Actions Taken tracking, and server-side aggregation metrics for role dashboards. Working in tandem with the Antigravity agent proved instrumental in accelerating both backend database operations and frontend UI component construction.

### Strengths and Efficiency Gains
- **Database & Architecture Setup:** The agent drafted comprehensive REST API contracts and Prisma schema changes with optimistic version locking (`version Int @default(1)`) seamlessly, ensuring legacy tickets remained valid.
- **Test Generation:** Automated test suites across both Node/Express (Supertest) and React (Testing Library) were drafted alongside implementation, verifying edge cases like `409 Conflict` stale version rejections and follow-up validation rules.
- **Git Flow Discipline:** Collaborating with the agent ensured rigid adherence to the GitHub Projects Kanban workflow (`Specified` -> `Started` -> `PR Review` -> `Done`) and branch management (`feature/*` -> `lab4-staging` -> `main`).

### Challenges and Human Oversight
- **React Testing Memory Traps:** During Vitest component testing of `TicketDetail`, the agent initially used inline mock objects in `useAuth()` hook mocks, which triggered infinite `useEffect` re-renders and caused a Node heap out-of-memory error. I had to guide the agent to use stable mock object references (`const mockUser`) and scope dependencies to `user?.id`.
- **Browser vs. Node Globals:** In Vite client tests, using `global.fetch` threw TypeScript errors because `global` is a Node global not present in standard DOM typing. We corrected all mocks to `globalThis.fetch`.
- **Build Hardening:** During final hardening, running `tsc` revealed strict typing mismatches (`itPriority` enum and `Role` enum filters) that needed explicit type narrowing before a clean production build could pass.

Overall, pair-programming with the agent allowed us to deliver an extensive, production-grade service desk application while maintaining documentation fidelity, thorough test coverage, and strict code quality.
