# Lab 2 UI Specification

## Color Tokens
- Primary Green: `#006B3C` (Headers, Primary buttons)
- Secondary Green: `#0B7A46` (Hover states, links)
- Pale Green: `#EAF6EF` (Success states, highlights)
- Page Background: `#F5F7F6`
- Error Red: Dark red borders and text for form validation.
- Text: Dark charcoal-green for comfortable reading.

## Typography and Controls
- Fonts: System default sans-serif, using Bootstrap 5 sizing.
- Editable Fields: White background, neutral borders. Focus indicator visible.
- Read-only Fields: Soft gray-green shading to indicate disabled state.
- Buttons: Standard padding, distinct hierarchy (solid Primary Green vs outline secondary).

## Responsive Layouts
- **Desktop (>=992px):** Multi-column layout (e.g., 3 columns for category/system/priority). Dashboard uses full data table.
- **Tablet (768-991px):** Two-column layout where practical.
- **Mobile (<768px):** Fields stack vertically. Dashboard table converts to horizontal scroll or stacked cards. No clipping or overlap.

## Component States
- Loading: "Loading..." text or spinner centered on screen.
- Empty List: "No tickets found matching your criteria." message displayed elegantly.
- Validation: Red text immediately below the affected input field. Red asterisk for required fields.
- Success: Green confirmation badge or alert.
