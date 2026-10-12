# TokTickIT Sprint 4 UI Specification

## 1. Dashboards
- **Role Navigation:** Dashboards are now the default landing page upon login. The navigation bar must highlight the active page.
- **Requester Dashboard:**
  - **Metric Cards:** "My Open Tickets", "In Progress", "Resolved", "Closed".
  - **Lists:** "My Recent Tickets" displaying Ticket #, Summary, Status, and Date.
  - **Quick Actions:** "Create Ticket", "View My Tickets".
- **IT Staff Dashboard:**
  - **Metric Cards:** "New", "Open", "In Progress", "Waiting for Requester", "My Assigned".
  - **Lists:** "My Recent Tickets" (tickets assigned to the current user or recently updated).
  - **Quick Actions:** "Create Ticket", "Search Tickets", "My Queue".
- **Visuals:** Metric cards use large, readable typography for numbers, with secondary text for labels. Cards are arranged in a responsive grid.

## 2. Actions Taken (IT Staff Ticket Detail)
- **Layout:** Placed below the standard ticket details, either as a new tab or a distinct vertical section.
- **List Mode:** Displays existing actions chronologically. Each card shows Date/Time, Performed By, Description, Result, and Follow-up details.
- **Create/Edit Mode:** A form embedded or opened via a modal/expandable section containing:
  - Action Description (Textarea)
  - Result (Textarea)
  - Follow-up Required? (Checkbox)
  - Follow-up Note (Textarea, required if checkbox is checked)
  - Attachment Notes (Text Input)
- **Visual Distinction:** Actions Taken must be visually distinct from Public Comments and Internal Notes (e.g., using a distinct icon or subtle card border).

## 3. Resolution Feedback
- **Status Dropdown:** The ticket status dropdown must reflect the backend's permitted transition matrix. If a transition is invalid, it should either be disabled or present an immediate validation error upon selection.
- **Concurrency Error:** If a stale update is detected, a prominent alert banner (red/amber) must inform the user that the ticket was modified by someone else and must be refreshed.

## 4. Visual Checklist
- [x] **Design Consistency:** Uses the established Zen Green color palette (#006B3C for primary, #0B7A46 for secondary).
- [x] **Dashboards:** Metric cards are legible, properly aligned, and click-through to filtered lists where applicable.
- [x] **Actions Taken:** Editable controls are only visible to IT Staff/Admin; Requesters see a clean read-only view.
- [x] **Validation Placement:** Error messages appear directly underneath the offending input field in dark red text.
- [x] **Keyboard Focus:** Input fields and buttons show a clear focus ring for keyboard accessibility.
- [x] **Clipping/Overlap:** No text clipping or overlapping elements on any screen size.
- [x] **Horizontal Overflow:** Mobile tables collapse into cards or scroll horizontally without breaking the main page layout width.
