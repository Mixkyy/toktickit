# AI Use and Reflection (Lab 4)

**LLM Used:** Google Deepmind's Antigravity (Advanced Agentic Coding)

## Key Prompts Showing Critical Inquiry

1. **Scope Verification & Process Alignment:**
   > *"Just to make sure we are on the same page, before you do anything, can you tell me how many issues I have and what they are?"*
   - **Reasoning & Value:** Before writing any code, I challenged the agent to enumerate our exact issue boundaries and map them to the Kanban board columns. This prevented scope creep and ensured both of us adhered strictly to the 6 discrete Lab 4 deliverables (`#47` to `#52`).

2. **Concurrency Architecture & Conflict Strategy:**
   > *"How should we handle concurrent edits between two staff members on the same ticket without race conditions or overwriting work? Why use an optimistic version integer over timestamps?"*
   - **Reasoning & Value:** Rather than accepting the easiest implementation, I probed the trade-offs of optimistic locking strategies. Timestamps can suffer from clock skew, timezone mismatches, and database microsecond truncation; an explicit integer `version` field incremented atomically guarantees deterministic detection of stale updates and clean `409 Conflict` responses.

3. **Permission Boundary & Resolution Gate:**
   > *"If a requester marks their problem as resolved, should that automatically close the ticket, or should it go through an IT review gate? How does our state machine enforce that on the backend regardless of frontend requests?"*
   - **Reasoning & Value:** I questioned the business workflow rule (BR-04) regarding requester authority. This led to establishing a strict server-side transition matrix (`PERMITTED_STATUS_TRANSITIONS`) where requester feedback is strictly advisory, preventing requesters from bypassing IT triage or closing tickets unilaterally.

4. **React Testing Memory Leak & Infinite Loop Diagnosis:**
   > *"Why is the TicketWorkflow test running out of memory and crashing Vitest with a heap allocation failure? Is there an infinite loop or a problem with our mocks?"*
   - **Reasoning & Value:** When Vitest crashed with an `Allocation failed - JavaScript heap out of memory` error, I prompted the agent to investigate the re-render mechanics. We discovered that mock hooks returning fresh object literals (`useAuth: () => ({ user: { ... } })`) violated React's reference stability, triggering infinite `useEffect` executions in jsdom. We resolved it by pinning a stable `mockUser` reference and scoping dependencies to `user?.id`.

5. **Environment Typing & Cross-Platform Mocks:**
   > *"Why does `global.fetch` cause TypeScript errors in our client tests even though it runs fine in Node backend tests, and how do we make the test mocks strictly typed without breaking Vite's build?"*
   - **Reasoning & Value:** I pushed for clean typing across our isomorphic code. In the browser/DOM environment of Vite, `global` does not exist in standard DOM type definitions. Switching to ECMAScript standard `globalThis.fetch` resolved typing discrepancies cleanly without polluting the client tsconfig with Node globals.

6. **Server Aggregation vs. Client-side Filtering:**
   > *"For the role dashboards, why shouldn't we just fetch the ticket list to the frontend and compute the counts in React? What are the security and scalability implications of FR-08?"*
   - **Reasoning & Value:** I challenged the architectural decision between client-side array filtering versus backend aggregation queries. Client-side computation leaks unassigned ticket data to requesters and wastes network bandwidth, whereas server-side Prisma `count()` queries isolate metrics at the database level and scale to enterprise workloads.

7. **Compiler vs. Test Runner Blind Spots:**
   > *"Why did our tests pass with Vitest even though `tsc` failed when building the server and client? What did the TypeScript compiler catch that the test runners missed?"*
   - **Reasoning & Value:** This inquiry exposed a critical blind spot: Vitest transpile-only runners strip types via esbuild without type-checking. Running `tsc` during final hardening caught strict enum mismatches (`IT_Priority`, `Role`) and an unconfigured `noEmit` flag that would have caused silent compilation failures in production.

---

## My Reflection

Working through Sprint 4 demonstrated that advanced agentic AI is far more powerful when treated as an architectural sounding board rather than a passive code generator. The complexity of enterprise workflows—such as optimistic concurrency control, role-based status gates, and server-side aggregation—demanded constant critical thinking and questioning.

### Moving from Implementation to Interrogation
In earlier sprints, it was tempting to ask the AI simply to "build feature X." In Sprint 4, the most impactful interactions came from questioning *why* an approach was chosen and *what edge cases* could break it. Challenging the AI on concurrency models led to a robust integer-version locking pattern that prevented subtle race conditions. Similarly, debating the resolution review gate ensured that security constraints were enforced authoritatively on the backend rather than relying on UI button states.

### Debugging the "Hidden" Failure Modes
The most valuable moments of human oversight occurred when dealing with subtle environmental traps that automated tools masked:
- **Reference Stability in Test Mocks:** The agent's initial test mock caused catastrophic heap exhaustion due to unstable object references. Diagnosing this required understanding React's reconciliation cycle and guiding the agent toward referential equality.
- **Type Checker vs. Bundler Discrepancies:** Discovering that test suites passed while `tsc` failed highlighted that fast test runners (like esbuild-backed Vitest) do not guarantee type safety. Forcing full production builds (`tsc && vite build`) caught type errors before they reached production.

Ultimately, pair-programming with the AI elevated my role to an engineering lead: validating architectural decisions, asking probing questions, enforcing security boundaries, and ensuring that our codebase remains robust, maintainable, and verifiable.
