# Lab 2 API Contract

All API requests acting on behalf of a Requester must include the `X-Requester-Id` header to simulate the selected Development Requester context.

## 1. GET /api/requesters
Retrieves all active Development Requesters.
- **Response 200:** `[ { "id": 1, "name": "Jennifer Anderson", "email": "..." } ]`

## 2. GET /api/categories
Retrieves active Categories.
- **Response 200:** `[ { "id": 1, "name": "Hardware" } ]`

## 3. GET /api/related-systems
Retrieves active Related Systems.
- **Response 200:** `[ { "id": 1, "name": "Corporate Laptop" } ]`

## 4. POST /api/tickets
Creates a Ticket.
- **Headers:** `X-Requester-Id`
- **Body:** `{ "categoryId": 1, "relatedSystemId": 1, "summary": "...", "description": "...", "requestedPriority": "MEDIUM" }`
- **Response 201:** Created Ticket object with `ticketNumber`.
- **Response 400:** Validation error.

## 5. GET /api/tickets
Retrieves a paginated list of Tickets owned by the Requester.
- **Headers:** `X-Requester-Id`
- **Query:** `?page=1&search=...&status=...`
- **Response 200:** `{ "data": [...], "meta": { "total": 10, "page": 1, "totalPages": 2 } }`

## 6. GET /api/tickets/:id
Retrieves details of a specific Ticket.
- **Headers:** `X-Requester-Id`
- **Response 200:** Ticket object including attachment metadata.
- **Response 403/404:** If ticket does not exist or doesn't belong to the Requester.

## 7. POST /api/tickets/:id/attachments
Uploads an Attachment to a Ticket.
- **Headers:** `X-Requester-Id`
- **Body:** `multipart/form-data`
- **Response 201:** Attachment metadata.

## 8. DELETE /api/attachments/:id
Soft-removes an Attachment.
- **Headers:** `X-Requester-Id`
- **Response 200:** Success.
