# TokTickIT Sprint 3 API Contract

## Authentication & Session
- `POST /api/auth/login`
  - Body: `{ email, password }`
  - Response (200): Sets JWT cookie, returns `{ user: { id, email, name, role, requiresPasswordChange } }`
  - Error (401): Invalid credentials.
- `POST /api/auth/logout`
  - Response (200): Clears JWT cookie.
- `GET /api/auth/me`
  - Response (200): Returns current authenticated user.
- `POST /api/auth/change-password`
  - Body: `{ currentPassword, newPassword }`
  - Response (200): Updates password, sets `requiresPasswordChange: false`.

## Tickets (IT Staff Extensions)
- `GET /api/staff/tickets`
  - Query: `?search=...&status=...&categoryId=...&page=1&limit=10&sortBy=createdAt&sortOrder=desc`
  - Response (200): `{ data: Ticket[], total: number, page: number, totalPages: number }`
  - Auth: IT_STAFF or ADMINISTRATOR only.
- `PUT /api/staff/tickets/:id`
  - Body: `{ ownerId?, itPriority?, currentStatus? }`
  - Response (200): Updated Ticket.
  - Auth: IT_STAFF or ADMINISTRATOR only.

## Comments & Internal Notes
- `GET /api/tickets/:id/comments`
  - Response (200): Returns Public Comments (all roles) and Internal Notes (only if IT_STAFF or ADMIN).
- `POST /api/tickets/:id/comments`
  - Body: `{ content, isInternal }`
  - Response (201): Created Comment/Note.
  - Auth: `isInternal=true` rejected for REQUESTER.

## Administrator User Management
- `GET /api/users`
  - Query: `?search=...&role=...`
  - Response (200): `User[]` (excluding passwords).
  - Auth: ADMINISTRATOR only.
- `POST /api/users`
  - Body: `{ email, name, role, initialPassword, isActive }`
  - Response (201): Created User.
  - Error (409): Email already exists.
- `PUT /api/users/:id`
  - Body: `{ email?, name?, role?, isActive?, newInitialPassword? }`
  - Response (200): Updated User.
  - Error (400): Cannot deactivate self / last admin.
