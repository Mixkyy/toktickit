import express, { Request, Response } from "express";
import cors from "cors";
import { getPrisma } from "./prisma.js";
// getPrisma() is your lazy database handle. Call it INSIDE a route when you
// need the DB (Issue 4). It is intentionally unused until then.
void getPrisma;

// The Express app is exported separately from app.listen() (see index.ts) so
// Supertest can import `app` without opening a port. Do not merge these files.
export const app = express();

app.use(cors());          // already wired: lets the Vite dev server call this API
app.use(express.json());

// ---------------------------------------------------------------------------
// Issue 2 — API health check
// Make the test in tests/lab-01/health.test.ts pass.
// It must return HTTP 200 with JSON: { status: "ok", service: "TokTickIT API" }
// ---------------------------------------------------------------------------
app.get("/api/health", (_req: Request, res: Response) => {
  // TODO (Issue 2): replace this stub with the required 200 response.
  res.status(200).json({ status: "ok", service: "TokTickIT API" });
});

// ---------------------------------------------------------------------------
// Issue 4 — Category list
// Add:  GET /api/categories
//   -> read categories from PostgreSQL via getPrisma().category.findMany(...)
//   -> return each { id, name } in a predictable (id) order
//   -> on failure, respond 500 with a safe message (no internal details)
// TODO(Issue 4): implement the route here.
// ---------------------------------------------------------------------------

app.get("/api/categories", async (_req: Request, res: Response) => {
  try {
    // 1. Get the lazy database handle
    const prisma = getPrisma();
    
    // 2. Fetch categories from PostgreSQL
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        id: 'asc', // Ensures predictable order by ID
      },
    });

    // 3. Return the array of categories with a 200 OK status
    res.status(200).json(categories);
    
  } catch (error) {
    // 4. On failure, respond with 500 and a safe message (no internal details)
    console.error("Database error:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

app.get("/api/requesters", async (_req: Request, res: Response) => {
  try {
    const prisma = getPrisma();
    const requesters = await prisma.requesterUser.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
    res.status(200).json(requesters);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Failed to fetch requesters" });
  }
});

app.get("/api/related-systems", async (_req: Request, res: Response) => {
  try {
    const prisma = getPrisma();
    const relatedSystems = await prisma.relatedSystem.findMany({
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });
    res.status(200).json(relatedSystems);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Failed to fetch related systems" });
  }
});

app.post("/api/tickets", async (req: Request, res: Response) => {
  try {
    const requesterIdStr = req.headers['x-requester-id'];
    if (!requesterIdStr) {
      return res.status(401).json({ error: "Unauthorized: Missing X-Requester-Id header" });
    }
    const requesterId = parseInt(requesterIdStr as string, 10);
    
    const { categoryId, relatedSystemId, summary, description, requestedPriority } = req.body;

    if (!categoryId || !relatedSystemId || !summary || !description || !requestedPriority) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const prisma = getPrisma();
    
    // Generate a unique ticket number (e.g., TKT-YYYY-MMDDHHMMSS or sequence)
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const ticketNumber = `TKT-${timestamp}`;

    const newTicket = await prisma.ticket.create({
      data: {
        ticketNumber,
        requesterId,
        categoryId: parseInt(categoryId, 10),
        relatedSystemId: parseInt(relatedSystemId, 10),
        summary,
        description,
        requestedPriority,
      },
    });

    res.status(201).json(newTicket);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Failed to create ticket" });
  }
});

app.get("/api/tickets", async (req: Request, res: Response) => {
  try {
    const requesterIdStr = req.headers['x-requester-id'];
    if (!requesterIdStr) {
      return res.status(401).json({ error: "Unauthorized: Missing X-Requester-Id header" });
    }
    const requesterId = parseInt(requesterIdStr as string, 10);
    
    // We only return tickets that belong to the current requester
    const where: any = { requesterId };
    
    // Status filter
    if (req.query.status) {
      where.currentStatus = String(req.query.status);
    }
    
    // Category filter
    if (req.query.categoryId) {
      where.categoryId = parseInt(String(req.query.categoryId), 10);
    }
    
    // Search filter (searches summary or ticketNumber)
    if (req.query.search) {
      const searchTerm = String(req.query.search);
      where.OR = [
        { summary: { contains: searchTerm, mode: 'insensitive' } },
        { ticketNumber: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }
    
    const prisma = getPrisma();
    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        category: true,
        relatedSystem: true,
      },
      orderBy: { createdAt: 'desc' } // Newest first
    });
    
    res.status(200).json(tickets);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

export default app;
