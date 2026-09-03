# Lab 2 API Specification

## Endpoints

### 1. Categories
`GET /api/categories`
- **Response:** `200 OK`, JSON Array of `{ id, name }`.

### 2. Related Systems
`GET /api/related-systems`
- **Response:** `200 OK`, JSON Array of `{ id, name }`.

### 3. Tickets
`GET /api/tickets`
- **Headers:** `X-Requester-Id` (Required)
- **Query Params:** `status`, `categoryId`, `search`
- **Response:** `200 OK`, JSON Array of filtered `Ticket` objects.

`POST /api/tickets`
- **Headers:** `X-Requester-Id` (Required)
- **Body:** `{ categoryId, relatedSystemId, summary, description, requestedPriority }`
- **Response:** `201 Created`, JSON Object of created `Ticket`.

`GET /api/tickets/:id`
- **Headers:** `X-Requester-Id` (Required)
- **Response:** `200 OK` (Ticket object with attachments) or `403 Forbidden` (Ownership failure) or `404 Not Found`.

### 4. Attachments
`POST /api/tickets/:id/attachments`
- **Headers:** `X-Requester-Id` (Required)
- **Body:** `multipart/form-data` with `attachment` field.
- **Response:** `201 Created` or `400 Bad Request` (Size/Type failure).

`GET /api/attachments/:id/download`
- **Headers:** `X-Requester-Id` (Required)
- **Response:** `200 OK` (File binary) or `403 Forbidden` or `404 Not Found` (If removed or missing).

`DELETE /api/attachments/:id`
- **Headers:** `X-Requester-Id` (Required)
- **Body:** `{ reason: string }`
- **Response:** `200 OK` `{ success: true }` or `400 Bad Request` (Missing reason).
