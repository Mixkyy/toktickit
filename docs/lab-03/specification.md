# TokTickIT Sprint 3 Engineering Specification

## 1. Sprint Goal
Deliver a secure, authenticated, and role-based ticketing system where Requesters can manage their tickets with real identities, IT Staff can actively manage a Ticket Queue and ticket lifecycles, and Administrators can manage user accounts.

## 2. Stakeholder Request
The business needs to transition from a temporary development selector to real user accounts with secure authentication. IT Staff require a professional workflow to process tickets efficiently, and Administrators need a minimalist interface to manage users and roles. Security and role-based access control must be strictly enforced.

## 3. Scope
**Included:**
- Secure authentication (email/password), logout, and mandatory first-login password change.
- Server-side role-based authorization for Requester, IT Staff, and Administrator.
- Data migration from Development Requester to an authenticated User model.
- IT Staff Ticket Queue with search, filter, sort, and pagination.
- Ticket Detail workflows (claim/reassign, IT Priority, status updates, Public Comments, Internal Notes).
- Minimalist Administrator User Management (view, create, edit, activate/deactivate, set initial password).

**Excluded:**
- Email invitations, self-registration, multi-factor authentication, single sign-on.
- Actions Taken by IT Staff, SLA calculation, dashboards/KPIs.
- Multi-tenant organizations, user deletion, bulk operations, role history.

## 4. Functional Requirements
- **FR-01 (Authentication):** The system shall authenticate users via email and password, utilizing secure hashing and sessions/tokens.
- **FR-02 (Password Change):** The system shall force users with an initial password to change it upon first successful login before accessing the application.
- **FR-03 (Role-Based Routing):** The system shall route authenticated users to their permitted default screen (Requester -> My Tickets, IT Staff -> Ticket Queue, Admin -> User Management).
- **FR-04 (IT Staff Queue):** The system shall provide IT Staff with a paginated, sortable, and filterable Ticket Queue.
- **FR-05 (IT Staff Workflow):** The system shall allow IT Staff to claim, reassign, update priority, and update permitted statuses of tickets.
- **FR-06 (Comments & Notes):** The system shall support Public Comments visible to all roles and Internal Notes visible only to IT Staff and Administrators.
- **FR-07 (Requester Resolution):** The system shall allow Requesters to indicate a problem appears resolved.
- **FR-08 (Admin User Management):** The system shall allow Administrators to list, search, filter, create, and edit user accounts.

## 5. Business Rules
- **BR-01:** Only an active user with valid credentials may authenticate.
- **BR-02:** A user marked as requiring a password change cannot enter the normal application until a new valid password is saved.
- **BR-03:** The authenticated user identity, not a requesterId supplied by the client, determines ownership of Requester operations.
- **BR-04:** Public Comments are visible to the Requester, IT Staff, and Administrator. Internal Notes are visible only to IT Staff and Administrator.
- **BR-05:** A Requester may indicate that the problem appears resolved, but cannot formally set the Ticket to Resolved or Closed.
- **BR-06:** An Administrator cannot deactivate their own account or remove the last active Administrator account.
- **BR-07:** Duplicate email addresses are not permitted across the system.
- **BR-08:** A Ticket may only have one primary Ticket Owner (IT Staff or Administrator).
- **BR-09:** Ticket Priority initially copies Requested Priority but can only be changed by IT Staff or Administrator.

## 6. UI Specification Summary
- **Design Language:** Zen Green theme with consistent tokens, cards, badges, and validation feedback.
- **Responsive:** Usable on desktop, tablet, and mobile.
- **Navigation:** Role-specific navigation shell.
- **Screens:** Login, Change Password, Requester Ticket Detail (updated), IT Staff Queue, IT Staff Ticket Detail, Admin User Management.
- **Feedback:** Clear loading, success, empty, forbidden, and error states.
*Reference: docs/lab-03/ui-spec.md*

## 7. Data Changes
- **New Model:** `User` (id, email, passwordHash, name, role, isActive, requiresPasswordChange, createdAt, updatedAt).
- **Enums:** `Role` (REQUESTER, IT_STAFF, ADMINISTRATOR).
- **Updates to Ticket:** Add `ownerId` (foreign key to User), `itPriority` (enum), updated status values.
- **New Models:** `Comment` (id, ticketId, authorId, content, isInternal, createdAt).
- **Migration:** Existing Development Requesters are migrated to `User` records with `role = REQUESTER` and a default hashed password.

## 8. API Contract
- Endpoints for Auth: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `POST /api/auth/change-password`.
- Endpoints for Users (Admin): `GET /api/users`, `POST /api/users`, `PUT /api/users/:id`.
- Endpoints for IT Staff Queue: `GET /api/staff/tickets`.
- Endpoints for Comments: `POST /api/tickets/:id/comments`, `GET /api/tickets/:id/comments`.
- Authentication via HTTP-only JWT cookies or Authorization header tokens.
*Reference: docs/lab-03/api-spec.md*

## 9. Acceptance Criteria
- **AC-01:** Given an active user with valid credentials, when the user logs in, then the backend establishes authenticated access and returns the permitted user identity and role.
- **AC-02:** Given a user who must change the initial password, when login succeeds, then normal application screens remain unavailable until a valid new password is saved.
- **AC-03:** Given an authenticated Requester, when the client supplies another requesterId, then the backend still applies the authenticated identity and does not return another Requester’s data.
- **AC-04:** Given a Requester account, when an Internal Note endpoint is requested, then the operation is rejected without exposing note content.
- **AC-05:** Given an IT Staff user, when viewing the Ticket Queue, then they see a paginated list of tickets that can be sorted and filtered by status and category.
- **AC-06:** Given an Administrator, when creating a new user, if the email already exists, then the system rejects the request with a validation error.

## 10. Definition of Done
- Specification documents (Spec DD) are complete and approved.
- All functional requirements are implemented and pass unit/API/E2E tests.
- UI follows the Zen Green theme and is fully responsive.
- Authorization matrix is strictly enforced on the server-side.
- Code is peer-reviewed and merged to `lab3-staging` then `main`.
- Required screenshots and final PDF are generated.

## 11. Assumptions and Decisions
- **Authentication:** We will use JWT (JSON Web Tokens) stored in an HTTP-only cookie for secure authentication, mitigating XSS risks.
- **Initial Password:** Administrators will set a plaintext initial password during user creation, which the backend will hash. The `requiresPasswordChange` flag will be set to `true`.
- **Migration:** Lab 2 `DevelopmentRequester` records will be transformed into `User` records by a Prisma migration script, assigning them the `REQUESTER` role and a default initial password (e.g., `Changeme123!`).
