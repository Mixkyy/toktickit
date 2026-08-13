# Lab 1 — AI Use and Reflection  (fill this in)

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
| 7 |  |  |
| 8 |  |  |
| 9 |  |  |
| 10 |  |  |

## Reflection
Two or three sentences: what made your prompts better, and one place you had to
correct or reject what the agent produced.
