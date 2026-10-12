# Lab 4 REST API Contract

## 1. Actions Taken Endpoints

### 1.1. Create Action Taken
**POST /api/tickets/:id/actions**
- **Authorization:** `IT_STAFF`, `ADMINISTRATOR`
- **Request Body:**
  ```json
  {
    "description": "Replaced the laptop battery.",
    "result": "Battery holds charge.",
    "followUpRequired": false,
    "followUpNote": "",
    "attachmentNotes": "See uploaded battery invoice."
  }
  ```
- **Responses:**
  - `201 Created`: Action saved successfully.
  - `400 Bad Request`: Validation failure (e.g., missing required fields, follow-up note missing when required).
  - `403 Forbidden`: Insufficient permissions or user does not own ticket (if strict assignment enforced).
  - `404 Not Found`: Ticket not found.

### 1.2. Retrieve Actions Taken
**GET /api/tickets/:id/actions**
- **Authorization:** `REQUESTER` (if owner), `IT_STAFF`, `ADMINISTRATOR`
- **Responses:**
  - `200 OK`: Returns an array of Action Taken objects.
  - `403 Forbidden`: Requester is not the owner of the ticket.

### 1.3. Update Action Taken
**PUT /api/tickets/:id/actions/:actionId**
- **Authorization:** `IT_STAFF`, `ADMINISTRATOR`
- **Request Body:** Similar to POST, allowing updates to description, result, etc.
- **Responses:**
  - `200 OK`: Updated successfully.
  - `404 Not Found`: Action or Ticket not found.

## 2. Dashboard Endpoints

### 2.1. Requester Dashboard
**GET /api/dashboards/requester**
- **Authorization:** `REQUESTER`
- **Responses:**
  - `200 OK`: 
    ```json
    {
      "metrics": {
        "openTickets": 3,
        "inProgress": 2,
        "resolved": 5,
        "closed": 12
      },
      "recentTickets": [ /* Array of recently updated tickets owned by user */ ]
    }
    ```

### 2.2. IT Staff / Admin Dashboard
**GET /api/dashboards/staff**
- **Authorization:** `IT_STAFF`, `ADMINISTRATOR`
- **Responses:**
  - `200 OK`:
    ```json
    {
      "metrics": {
        "new": 14,
        "open": 23,
        "inProgress": 18,
        "waitingForRequester": 7,
        "myAssigned": 16
      },
      "recentTickets": [ /* Array of recent or urgent tickets */ ]
    }
    ```

## 3. Concurrency Handing
**PUT /api/tickets/:id**
- **Updates:** Now requires a `version` field in the request body for optimistic locking.
- **Responses:**
  - `200 OK`: Updated successfully, returns new `version`.
  - `409 Conflict`: The `version` provided in the request is older than the `version` in the database. The client must refresh the ticket data before attempting to save again.
