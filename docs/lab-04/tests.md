# Lab 4 Test Plan and Results

## 1. Test Strategy
The test strategy focuses on verifying the final workflow features: Actions Taken operations, accurate dashboard metric calculations, optimistic concurrency control to prevent data loss, and final regression of all Lab 1-3 features.

## 2. Planned Tests

| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final |
|---|---|---|---|---|---|---|
| API-03 | API | AC-01 | Create a valid Actions Taken | Created under the correct Ticket and actor | server/tests/lab-04/actions-taken.api.test.ts | Pass |
| API-04 | API | AC-04 | Create Action with Follow-Up missing | 400 Bad Request returned | server/tests/lab-04/actions-taken.api.test.ts | Pass |
| API-05 | API | FR-05 | Concurrent update with stale version | 409 Conflict returned | server/tests/lab-04/ticket-workflow.api.test.ts | Pending |
| API-06 | API | AC-02 | Requester Dashboard metrics isolation | Returns only metrics for tickets owned by Requester | server/tests/lab-04/requester-dashboard.api.test.ts | Pending |
| API-07 | API | FR-07 | IT Staff Dashboard metrics | Returns accurate system-wide metrics and user's assigned counts | server/tests/lab-04/staff-dashboard.api.test.ts | Pending |
| UI-01 | UI | FR-06 | Requester Dashboard Rendering | Displays metric cards and recent tickets table | client/tests/lab-04/RequesterDashboard.test.tsx | Pending |
| UI-02 | UI | FR-07 | Staff Dashboard Rendering | Displays metric cards and recent tickets | client/tests/lab-04/StaffDashboard.test.tsx | Pending |
| E2E-02 | E2E | AC-03 | Concurrent ticket edit flow | Client shows conflict warning and prevents save | e2e/lab-04/ticket-resolution.spec.ts | Pending |
| E2E-03 | E2E | FR-01 | Complete Actions Taken flow | IT Staff creates action, Requester views it | e2e/lab-04/actions-taken-flow.spec.ts | Pending |

## 3. Acceptance-Criterion Traceability
- **AC-01:** Covered by API-03, E2E-03.
- **AC-02:** Covered by API-06, UI-01.
- **AC-03:** Covered by API-05, E2E-02.
- **AC-04:** Covered by API-04.

## 4. Responsive and Visual Checklist
- [ ] Dashboards scale gracefully to tablet/mobile viewports.
- [ ] Actions Taken UI clearly separates from Comments/Notes visually.
- [ ] Stale-update conflict errors are highly visible and non-destructive.

## 5. Test Commands
```bash
# Run backend tests
cd server && npm test

# Run frontend tests
cd client && npm test
```

## 6. Final Results
*(To be populated after implementation)*

## 7. Known Limitations or Deferred Tests
- E2E tests for complex multi-tab concurrency scenarios may be difficult to automate stably in the provided environment, relying primarily on API tests for the 409 Conflict logic.
