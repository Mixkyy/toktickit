# Lab 2 — Test Plan and Evidence

All test files live under server/tests/lab-02/ and client/tests/lab-02/.

| # | Tool | Test | Result |
|---|------|------|--------|
| 1 | Vitest | RequesterSelection renders and sets context | Pass |
| 2 | Vitest | CreateTicket validates inputs and handles submission | Pass |
| 3 | Vitest | Dashboard filters by status and category | Pass |
| 4 | Vitest | TicketDetail renders and handles attachment removal | Pass |
| 5 | Supertest | POST /api/tickets/:id/attachments handles uploads correctly | Pass |

Paste your passing terminal output / screenshot below.

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
