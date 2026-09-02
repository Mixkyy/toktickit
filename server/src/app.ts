import express, { Request, Response } from "express";
import cors from "cors";
import { getPrisma } from "./prisma.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer config (5MB limit, specific formats)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and PDF are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});
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

app.get("/api/tickets/:id", async (req: Request, res: Response) => {
  try {
    const requesterIdStr = req.headers['x-requester-id'];
    if (!requesterIdStr) {
      return res.status(401).json({ error: "Unauthorized: Missing X-Requester-Id header" });
    }
    const requesterId = parseInt(requesterIdStr as string, 10);
    const ticketId = parseInt(req.params.id, 10);

    const prisma = getPrisma();
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        category: true,
        relatedSystem: true,
        attachments: {
          where: { isRemoved: false },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    if (ticket.requesterId !== requesterId) {
      return res.status(403).json({ error: "Forbidden: You do not own this ticket" });
    }

    res.status(200).json(ticket);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Failed to fetch ticket" });
  }
});

app.post("/api/tickets/:id/attachments", upload.single('attachment'), async (req: Request, res: Response) => {
  try {
    const requesterIdStr = req.headers['x-requester-id'];
    if (!requesterIdStr) {
      return res.status(401).json({ error: "Unauthorized: Missing X-Requester-Id header" });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded or invalid file type" });
    }

    const requesterId = parseInt(requesterIdStr as string, 10);
    const ticketId = parseInt(req.params.id, 10);

    const prisma = getPrisma();
    
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { attachments: { where: { isRemoved: false } } }
    });

    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    if (ticket.requesterId !== requesterId) return res.status(403).json({ error: "Forbidden: You do not own this ticket" });
    
    if (ticket.attachments.length >= 5) {
      // Remove the uploaded file since we are rejecting
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Maximum of 5 active attachments allowed" });
    }

    const attachment = await prisma.attachment.create({
      data: {
        ticketId,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        filePath: req.file.filename
      }
    });

    res.status(201).json(attachment);
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message || "Failed to upload attachment" });
  }
});

app.get("/api/attachments/:id/download", async (req: Request, res: Response) => {
  try {
    const requesterIdStr = req.headers['x-requester-id'];
    if (!requesterIdStr) {
      return res.status(401).json({ error: "Unauthorized: Missing X-Requester-Id header" });
    }
    const requesterId = parseInt(requesterIdStr as string, 10);
    const attachmentId = parseInt(req.params.id, 10);

    const prisma = getPrisma();
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { ticket: true }
    });

    if (!attachment || attachment.isRemoved) {
      return res.status(404).json({ error: "Attachment not found or has been removed" });
    }

    if (attachment.ticket.requesterId !== requesterId) {
      return res.status(403).json({ error: "Forbidden: You do not own this ticket" });
    }

    const filePath = path.join(process.cwd(), 'uploads', attachment.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found on disk" });
    }

    res.download(filePath, attachment.fileName);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ error: "Failed to download attachment" });
  }
});

app.delete("/api/attachments/:id", async (req: Request, res: Response) => {
  try {
    const requesterIdStr = req.headers['x-requester-id'];
    if (!requesterIdStr) {
      return res.status(401).json({ error: "Unauthorized: Missing X-Requester-Id header" });
    }
    const requesterId = parseInt(requesterIdStr as string, 10);
    const attachmentId = parseInt(req.params.id, 10);
    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ error: "A reason is required to remove an attachment" });
    }

    const prisma = getPrisma();
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { ticket: true }
    });

    if (!attachment || attachment.isRemoved) {
      return res.status(404).json({ error: "Attachment not found or already removed" });
    }

    if (attachment.ticket.requesterId !== requesterId) {
      return res.status(403).json({ error: "Forbidden: You do not own this ticket" });
    }

    await prisma.attachment.update({
      where: { id: attachmentId },
      data: { isRemoved: true, removedReason: reason }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to remove attachment" });
  }
});

export default app;
