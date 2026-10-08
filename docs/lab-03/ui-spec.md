# TokTickIT Sprint 3 UI Specification

## 1. Application Shell & Navigation
- **Header:** Replaces the Lab 2 selector with the authenticated user's Name, Role badge, and a "Logout" button.
- **Role Navigation:**
  - Requester: "My Tickets"
  - IT Staff: "Ticket Queue"
  - Administrator: "User Management"

## 2. Login & Password Change Screens
- **Login Screen:** Minimalist card with Email, Password, and a green "Sign In" button. Shows red text below inputs for invalid credentials.
- **Change Password Screen:** Fields for Current Password, New Password, Confirm Password. Includes a visual checklist for password requirements (min 8 chars, uppercase, number).

## 3. Requester Ticket Detail Updates
- **Public Comments:** A new section below the description for Requesters to view and post Public Comments.
- **Resolution:** A "Problem Appears Resolved" button that adds a predefined public comment and notifies IT Staff, but does not close the ticket directly.

## 4. IT Staff Ticket Queue
- **Layout:** A responsive data table displaying Ticket #, Created Date, Summary, Category, Requested Priority, IT Priority, Status, and Ticket Owner.
- **Controls:**
  - Search bar (by Ticket # or keywords).
  - Filter dropdowns (Status, Category, Priority).
  - Sortable column headers.
  - Pagination controls at the bottom (`< Previous 1 2 3 Next >`).
- **Responsive:** On mobile, columns collapse into a card-based layout or allow horizontal scrolling.

## 5. IT Staff Ticket Detail
- **Layout:** Extends the Requester view but makes operational fields editable (Owner dropdown, Status dropdown, IT Priority dropdown).
- **Communication:** Contains distinct tabs or visual sections for "Public Comments" (green accents) and "Internal Notes" (yellow/gray accents to indicate privacy).
- **Actions:** "Claim Ticket", "Update Status", "Save Note".

## 6. Administrator User Management
- **Layout:** A simple list/grid of users showing Name, Email, Role, and Status (Active/Inactive).
- **Controls:** "Create User" button opens a modal or new page.
- **Form:** Fields for Full Name, Email, Role (Dropdown), Status Toggle, and a checkbox to "Require Password Change on Next Login" along with a temporary password input.

## 7. Visual Checklist
- [x] **Design Consistency:** Uses the established Zen Green color palette (#006B3C for primary, #0B7A46 for secondary).
- [x] **Role Navigation:** Navigation bar correctly updates to show only permitted pages based on the user's role.
- [x] **Badges:** Consistent styling for Roles, Statuses (e.g., green for resolved, yellow for pending), and IT Priorities.
- [x] **Editable/Read-Only:** Clear visual distinction between fields the user can edit vs. read-only fields (e.g., grayed out background).
- [x] **Validation Placement:** Error messages appear directly underneath the offending input field in dark red text.
- [x] **Focus States:** Input fields show a clear focus ring for keyboard accessibility.
- [x] **Clipping/Overlap:** No text clipping or overlapping elements on any screen size.
- [x] **Horizontal Overflow:** Mobile tables collapse into cards or scroll horizontally without breaking the main page layout width.
