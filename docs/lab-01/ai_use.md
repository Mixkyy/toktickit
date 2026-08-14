# Lab 1 — AI Use and Reflection

**LLM/agent used:** Gemini

## Selected key prompts (6–10)
| # | Prompt (summarised) | What I did with the result |
|---|---------------------|----------------------------|
| 1 | The instructions don't explicitly mention Docker, only PostgreSQL. Why should I use Docker instead of a local install? | Evaluated technical tradeoffs and decided to use Docker to isolate the database and keep the development environment clean. |
| 2 | How do I construct my Prisma database connection string securely using the docker-compose.yml values? | Mapped the Docker credentials (user, password, port 5432) into a URL and stored it securely inside a local .env file. |
| 3 | My .env file has PORT=3000 but the Docker config exposes port 5432. Will these conflict? | Understood backend architecture better, realizing port 3000 is for the Express API while 5432 is dedicated to PostgreSQL traffic. |
| 4 | The lab sheet requires specific fields for the Category model. How do I map this safely so the Prisma seed doesn't create duplicates? | Updated schema.prisma with the exact fields and used Prisma's upsert function in the seed script to ensure idempotency. |
| 5 | I'm checking my .gitignore file. It blocks .env but allows .env.example. Is this the correct standard practice? | Verified my repository security, ensuring sensitive database passwords stay hidden while team members still get the template. |
| 6 | Since my Pull Request is already open, how does pushing these database fixes affect the existing PR? | Learned that pushing new commits automatically updates the existing open PR, allowing my peer reviewer to see the latest changes before approving. |
| 7 | How do I fix the ENOENT error when running npm run test inside the root directory? | Navigated to the correct subdirectory (`server` or `client`) where the individual package.json file lives instead of running it globally. |
| 8 | How do I write a Vitest test for the React App component that mocks fetch and handles success/error states? | Implemented the mock setup for asynchronous API responses and button click simulation to satisfy testing acceptance criteria. |
| 9 | Why am I getting a TypeScript error saying 'Cannot find name global' in my Vitest test? | Corrected the environment mismatch by changing `global` to `globalThis` to align with the Vite browser-like testing runtime. |
| 10 | What is the exact sequence of documentation updates required before my teammate approves the Issue 4 PR? | Prioritized committing `tests.md`, `ai_use.md`, and `reviewer.md` before merging to maintain strict compliance with the lab's engineering workflow rules. |

## Reflection
Iterating on prompts with precise error messages and file paths made the agent's responses significantly more actionable rather than providing generic code snippets. However, one place I had to reject or correct the output was when the model suggested using the Node.js `global` keyword in a Vite/React environment, which caused errors until I looked it up and modified it to `globalThis`.