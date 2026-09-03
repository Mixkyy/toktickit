# Lab 2 — AI Use and Reflection

**LLM/agent used:** Gemini (Antigravity)

## Selected key prompts (6–10)
| # | Prompt (summarised) | What I did with the result |
|---|---------------------|----------------------------|
| 1 | How do I implement the RequesterUser global state across multiple React components? | Used the suggested Context API pattern to wrap the App and provide the selected requester ID to both the Dashboard and Create Ticket components. |
| 2 | I need to seed realistic IT ticket data using Prisma, but ensure the related systems and requesters exist first. | Structured the Prisma seed file sequentially, first upserting Systems and Requesters, then mapping their IDs to generate the Ticket data. |
| 3 | My frontend Dashboard needs to handle URL query parameters for filtering tickets by Status and Category. | Applied the recommended `URLSearchParams` logic in the useEffect hook to dynamically construct the backend fetch URL based on the filter states. |
| 4 | How do I implement soft deletion for attachments without permanently deleting the record? | Added an `isRemoved` boolean and `removedReason` string to the Prisma schema, and updated the DELETE API endpoint to modify these fields instead of dropping the row. |
| 5 | How do I set up multer in Express to enforce a 5MB limit and only accept specific file types? | Integrated the `multer.diskStorage` configuration provided by the AI, including the custom `fileFilter` validation logic to reject unsupported formats. |
| 6 | The UI needs a prompt to ask for a removal reason when deleting an attachment. | Used `window.prompt` in the React component to capture the reason before sending the DELETE request to the backend. |
| 7 | My frontend tests are failing with 'useRequester must be used within a RequesterProvider'. | Updated the Vitest mock configuration to wrap the tested components in a mock provider or mock the hook directly, ensuring context is available during tests. |
| 8 | I accidentally merged my branch into main directly on GitHub. How do I fix this? | Followed the AI's instructions to click the Revert button on GitHub to cleanly undo the accidental merge without losing the original branch. |
| 9 | My Pull Request has merge conflicts with main after the revert. How do I resolve this safely? | Used the AI to pull the latest changes, resolve the conflicts locally on `lab2-staging` by favoring the correct code, and pushed the resolved state back to GitHub. |
| 10 | I need to ensure my `TicketDetail` page can download files stored locally in the `uploads/` folder. | Implemented the suggested Express endpoint `res.download()` method and hooked it up to the frontend using `URL.createObjectURL()`. |

## Reflection
Working through Lab 2 introduced a lot of complexity around managing state, handling file uploads, and dealing with git branching. The AI was extremely helpful for the heavy lifting of the `multer` configuration and Prisma schema updates. One place where I had to iterate and correct things was during the Git conflict resolution phase; the AI initially tried to push directly to `main` via the terminal, which bypassed the required Pull Request workflow. I had to explicitly tell it to undo that push and resolve the conflicts locally on my staging branch so I could complete the merge correctly through the GitHub UI. This taught me a lot about strict Git workflows and recovering from bad merges!
