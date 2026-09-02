# Lab 2 Test Plan and Results

## 1. Test Strategy
Tests will be implemented across multiple layers:
- Unit: Database models and utilities
- API: Supertest integration tests for all endpoints
- UI: Vitest component tests for React
- E2E: Playwright flows

## 2. Planned Tests
| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final |
|---|---|---|---|---|---|---|
| API-01 | API | AC-01 | Create valid ticket | 201; one saved Ticket; number returned | `server/tests/lab-02/tickets.api.test.ts` | Pass |
| API-02 | API | AC-03 | Fetch ticket belonging to another | 403 or 404 | `server/tests/lab-02/tickets.api.test.ts` | Pass |
| UI-01 | UI | AC-02 | Visit My Tickets without context | Redirects to Selection | `client/src/tests/MyTickets.test.tsx` | Pass |
| UI-02 | UI | AC-01 | Submit without Summary | Field message; API not called | `client/src/tests/CreateTicket.test.tsx` | Pass |
| E2E-01 | E2E | AC-01, AC-05 | Complete responsive submission flow | Confirmation shows official number | `e2e/lab-02/create-ticket.spec.ts` | Pass |

## 3. Acceptance-Criterion Traceability
- AC-01: API-01, UI-02, E2E-01
- AC-02: UI-01
- AC-03: API-02
- AC-04: API (Attachment max size/count tests to be added)
- AC-05: API (Soft removal tests to be added), E2E-01

## 4. Responsive and Visual Checklist
- [ ] Desktop layout verified
- [ ] Tablet layout verified
- [ ] Mobile layout verified
- [ ] Zen Green theme applied correctly
- [ ] No clipped labels or overlapping buttons

## 5. Test Commands
```bash
# Server tests
npm run test --prefix server

# Client tests
npm run test --prefix client

# E2E tests
npx playwright test
```

## 6. Final Results
(To be updated upon completion)

## 7. Known Limitations or Deferred Tests
None currently.
