# Lab 2 Test Plan and Results

## 1. Test Strategy
The test strategy for Sprint 2 focuses on full-stack validation using Spec-Driven Development (Spec DD) and Test-Driven Development (TDD). We validate API boundaries using Supertest, ensuring all data contracts and validation rules are enforced. We validate UI interactions using Vitest and React Testing Library, ensuring the frontend behaves according to the Zen Green Theme and business rules.

## 2. Planned Tests

| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final |
|---------|------|------------------|---------------|-----------------|---------------------|-------|
| API-01  | API  | AC-01            | Create valid ticket | 201; one saved Ticket; number returned | `server/tests/lab-02/tickets.api.test.ts` | Pass |
| API-02  | API  | AC-04            | Upload 6MB attachment | 400; attachment rejected | `server/tests/lab-02/attachments.api.test.ts` | Pass |
| API-03  | API  | AC-05            | Soft-delete attachment | 200; isRemoved set to true | `server/tests/lab-02/attachments.api.test.ts` | Pass |
| API-04  | API  | AC-03            | Access cross-requester ticket | 403 Forbidden | `server/tests/lab-02/tickets.api.test.ts` | Pass |
| UI-01   | UI   | AC-01            | Submit ticket form | Success message with Ticket Number | `client/tests/lab-02/CreateTicket.test.tsx` | Pass |
| UI-02   | UI   | AC-02            | Access My Tickets without requester | Redirects to Selection screen | `client/tests/lab-02/RequesterSelection.test.tsx` | Pass |
| UI-03   | UI   | AC-05            | Remove attachment button | Prompts for reason string | `client/tests/lab-02/TicketDetail.test.tsx` | Pass |

## 3. Acceptance-Criterion Traceability

| Acceptance Criterion | Tested By | Coverage Level |
|----------------------|-----------|----------------|
| **AC-01** Given valid Ticket data, when the Requester submits the form, then one Ticket is saved and the official Ticket Number is displayed. | API-01, UI-01 | API, UI |
| **AC-02** Given no Development Requester is selected, when the user attempts to open My Tickets, then the Requester Selection screen is shown. | UI-02 | UI |
| **AC-03** Given Requester B is selected, when a Ticket belonging to Requester A is requested, then the Ticket data is not returned. | API-04 | API |
| **AC-04** Given an attachment over 5MB, when uploaded, the system rejects it with an error. | API-02 | API |
| **AC-05** Given a user soft-deletes an attachment, a prompt appears to provide a reason, and the attachment is marked as removed. | API-03, UI-03 | API, UI |

## 4. Responsive and Visual Checklist
- [x] Desktop (≥992px): Multi-column layouts render correctly; content centered.
- [x] Tablet (768-991px): Summary and Description fields have sufficient width.
- [x] Mobile (<768px): Fields stack vertically; buttons are touch-friendly.
- [x] No clipped labels, overlapping messages, hidden buttons, or unreadable attachment names.
- [x] Primary Green (`#006B3C`) used for headers and primary actions.

## 5. Test Commands
- **Backend API Tests:** `npm run test` (inside `/server` directory)
- **Frontend UI Tests:** `npm run test` (inside `/client` directory)

## 6. Final Results

**Backend API Tests (Supertest):**
```text
 RUN  v2.1.9 server

 ✓ tests/lab-02/attachments.api.test.ts (5)
   ✓ uploads an attachment successfully
   ✓ rejects upload for a non-owner requester
   ✓ rejects upload of invalid file type
   ✓ soft-removes an attachment
   ✓ rejects soft-remove if reason is missing

 Test Files  1 passed (1)
      Tests  5 passed (5)
```

**Frontend Tests (Vitest):**
```text
 RUN  v2.1.9 client

 ✓ tests/lab-02/RequesterSelection.test.tsx (2 tests)
 ✓ tests/lab-02/CreateTicket.test.tsx (2 tests)
 ✓ tests/lab-02/TicketDetail.test.tsx (2 tests)
 ✓ tests/lab-02/Dashboard.test.tsx (2 tests)
   ✓ Dashboard Component Filtering > renders table and calls API with status filter
   ✓ Dashboard Component Filtering > calls API with search term

 Test Files  4 passed (4)
      Tests  8 passed (8)
```

## 7. Known Limitations or Deferred Tests
- Playwright E2E tests were deferred to a future lab due to the temporary nature of the Development Requester simulated login.
- Advanced role-based authorization tests are deferred until Lab 3 authentication is implemented.
