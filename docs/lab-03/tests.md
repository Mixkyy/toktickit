# TokTickIT Sprint 3 Test Plan

| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final |
|---|---|---|---|---|---|---|
| API-01 | API | AC-01 | Valid login | Authenticated response; safe user data | `server/tests/lab-03/auth.api.test.ts` | TBD |
| API-02 | API | AC-01 | Invalid login | 401 Unauthorized; safe error message | `server/tests/lab-03/auth.api.test.ts` | TBD |
| API-03 | API | AC-02 | Mandatory password change | Block normal APIs if requiresPasswordChange=true | `server/tests/lab-03/auth.api.test.ts` | TBD |
| API-04 | API | AC-03 | Requester ticket isolation | Cannot fetch tickets owned by other requesters | `server/tests/lab-03/authorization.api.test.ts` | TBD |
| API-05 | API | AC-04 | Requester requests Internal Notes | 403 Forbidden; no note data returned | `server/tests/lab-03/comments-notes.api.test.ts` | TBD |
| API-06 | API | AC-05 | IT Staff Queue pagination/sort | Returns correct paginated and sorted slice | `server/tests/lab-03/staff-queue.api.test.ts` | TBD |
| API-07 | API | AC-06 | Admin create duplicate user | 409 Conflict error | `server/tests/lab-03/users-admin.api.test.ts` | TBD |
| E2E-01 | E2E | FR-01 | Login workflow | User can log in and see correct shell | `e2e/lab-03/authentication.spec.ts` | TBD |
| E2E-02 | E2E | AC-02 | Initial password login and change | Normal app opens only after valid change | `e2e/lab-03/first-login.spec.ts` | TBD |
| E2E-03 | E2E | FR-04 | IT Staff Ticket Queue UI | Filters and pagination work correctly | `e2e/lab-03/staff-ticket-flow.spec.ts` | TBD |
| E2E-04 | E2E | FR-08 | Admin User Management UI | Can create user and view in list | `e2e/lab-03/user-administration.spec.ts` | TBD |
