# Lab 4 Sprint Engineering Specification

## 1. Sprint Goal
Deliver the final service-desk workflow by implementing the "Actions Taken" feature for IT Staff to record work on tickets, enforcing strict status-transition rules, providing role-specific analytic dashboards, and hardening the entire application for final deployment while preserving all prior functionality.

## 2. Stakeholder Request Interpretation
The stakeholder wants to move beyond simple ticket communication and formally track the actual work being done. IT Staff need to log "Actions Taken" on a ticket, which include the date, description, result, follow-up needs, and attachment notes. The system needs to support multiple IT Staff collaborating on a ticket (though only one is the formal Owner). Furthermore, all users need personalized dashboards to quickly see metrics and priority work instead of just raw lists. The final application must be polished, responsive, and secure against concurrent update conflicts.

## 3. Scope
### Included
- Prisma schema update for `ActionTaken` model and migration strategies for legacy tickets.
- Actions Taken REST APIs (create, update) and UI for IT Staff.
- Read-only Actions Taken UI for Requesters.
- Role-specific Dashboard APIs and UI (Requester, IT Staff, Administrator).
- Ticket status transition matrix enforcement on the backend.
- Concurrency control / Stale-update handling.
- Final regression testing and UI hardening.

### Excluded
- Automatic SLA clocks, escalation engines, on-call scheduling.
- External notification services (email, SMS).
- Inventory or billing/payroll calculations.
- Multi-level approval workflows or electronic signatures.
- Advanced BI tools or export warehouses.
- Multi-tenant architectures.

## 4. Functional Requirements
- **FR-01:** IT Staff and Administrators can create and update an Action Taken for an accessible ticket.
- **FR-02:** Requesters can view Actions Taken on their own tickets, but cannot create or edit them.
- **FR-03:** Each Action Taken must capture: Date/Time, Description, Result, Performed By (auto-populated), Follow-Up Required (boolean), Follow-up Note (conditional), and Attachment Notes.
- **FR-04:** The backend must strictly enforce the permitted Ticket status-transition matrix regardless of the client request.
- **FR-05:** The backend must detect and reject concurrent/stale updates to a ticket to prevent accidental overwrites.
- **FR-06:** The system must provide a Requester Dashboard summarizing their open tickets, waiting tickets, and recently updated/resolved tickets.
- **FR-07:** The system must provide an IT Staff Dashboard summarizing unassigned tickets, their owned tickets, and tickets grouped by status/priority.
- **FR-08:** Dashboards must calculate metrics via backend database queries, not by fetching all tickets to the frontend.

## 5. Business Rules
- **BR-01:** An Action Taken belongs to exactly one Ticket.
- **BR-02:** The primary Ticket Owner coordinates the Ticket, but an Action Taken may be performed and recorded by a different IT Staff member.
- **BR-03:** A Follow-Up Note is required if and only if Follow-Up Required is true.
- **BR-04:** A Requester clicking "Problem Appears Resolved" does not automatically close the ticket; it only flags it for IT Staff review.
- **BR-05:** Stale-update handling: If a client submits an update based on stale ticket data (e.g., another user modified it in the meantime), the server must reject the update with a safe conflict error.

## 6. UI Specification Summary
- **Dashboards:** New starting pages for each role featuring concise metric cards with readable labels, values, and accessible drill-down actions.
- **Actions Taken UI:** Appended to the existing Ticket Detail screens. IT Staff see a form to add/edit actions and a list of existing actions. Requesters see a read-only list.
- **Responsive Rules:** Dashboards and Action lists must collapse cleanly on mobile (cards stack vertically).

## 7. Data Changes
- **New Model:** `ActionTaken`
  - `id` (Int, PK)
  - `ticketId` (Int, FK to Ticket)
  - `actionDate` (DateTime)
  - `description` (String)
  - `result` (String)
  - `performedById` (Int, FK to User)
  - `followUpRequired` (Boolean)
  - `followUpNote` (String, nullable)
  - `attachmentNotes` (String, nullable)
- **Ticket Model Update:** Add a `version` (Int) field for optimistic concurrency control to handle stale updates.
- **Migration & Backfill:** Legacy tickets without Actions Taken remain valid. Default `version` to 1.

## 8. API Contract
- `POST /api/tickets/:id/actions`: Create an action taken (IT Staff/Admin).
- `PUT /api/tickets/:id/actions/:actionId`: Update an action taken.
- `GET /api/dashboards/requester`: Retrieve requester metrics.
- `GET /api/dashboards/staff`: Retrieve IT Staff metrics.
- `PUT /api/tickets/:id`: Must now validate `version` to prevent concurrent edits.

## 9. Acceptance Criteria
- **AC-01:** Given a permitted IT Staff user, when an Action Taken is created, then it is saved under the correct Ticket with the authenticated creator as the performer.
- **AC-02:** Given an authenticated Requester, when dashboard data is retrieved, then only metrics and recent Tickets owned by that Requester are returned.
- **AC-03:** Given two IT Staff editing the same ticket concurrently, when the second staff submits their update, then the backend rejects the request with a stale-update error.
- **AC-04:** Given an Action Taken form, when Follow-Up Required is checked but the Follow-Up Note is empty, then validation fails and the action is not saved.

## 10. Definition of Done
- Prisma schema migrated and seeded with zero/non-zero Action Taken scenarios.
- All backend REST APIs implemented with validation, authorization, and concurrency control.
- Dashboards and Action Taken UI integrated matching the Zen Green design.
- All unit, API, UI, and E2E tests pass.
- Peer review approved and code merged via staging branch workflow.
- No regression failures on Labs 1-3 features.

## 11. Assumptions and Decisions
- **Decision:** Concurrency control will be implemented via an optimistic locking mechanism (a `version` integer field on the Ticket).
- **Decision:** The Administrator dashboard will simply reuse the IT Staff dashboard layout and endpoints, with an additional query for user account counts.
