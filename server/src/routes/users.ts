import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authenticateToken } from '../utils/auth.js';
import bcrypt from 'bcrypt';

const router = Router();
const prisma = new PrismaClient();

// Authorization middleware for Administrator only
const requireAdmin = (req: Request, res: Response, next: Function) => {
  const user = (req as any).user;
  if (!user || user.role !== 'ADMINISTRATOR') {
    return res.status(403).json({ error: 'Forbidden: Administrators only' });
  }
  next();
};

router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/users
router.get('/', async (req: Request, res: Response) => {
  const { search, role } = req.query;

  const where: Prisma.UserWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: String(search), mode: 'insensitive' } },
      { email: { contains: String(search), mode: 'insensitive' } }
    ];
  }
  if (role) {
    where.role = String(role);
  }

  try {
    const users = await prisma.user.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        requiresPasswordChange: true,
        createdAt: true
      }
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/users
router.post('/', async (req: Request, res: Response) => {
  const { name, email, role, initialPassword, isActive } = req.body;

  if (!name || !email || !role || !initialPassword) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check duplicate email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(initialPassword, salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role,
        passwordHash,
        isActive: isActive !== false,
        requiresPasswordChange: true // BR-02: Enforce password change at first login
      },
      select: { id: true, name: true, email: true, role: true, isActive: true, requiresPasswordChange: true }
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /api/users/:id
router.put('/:id', async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const { name, email, role, isActive, newInitialPassword } = req.body;
  const currentUser = (req as any).user;

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    // Safety checks
    if (isActive === false) {
      if (currentUser.id === userId) {
        return res.status(400).json({ error: 'Cannot deactivate your own account' });
      }

      if (targetUser.role === 'ADMINISTRATOR') {
        const activeAdmins = await prisma.user.count({
          where: { role: 'ADMINISTRATOR', isActive: true }
        });
        if (activeAdmins <= 1) {
          return res.status(400).json({ error: 'Cannot deactivate the last active Administrator' });
        }
      }
    }

    if (email && email !== targetUser.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return res.status(409).json({ error: 'Email already in use' });
    }

    const updateData: Prisma.UserUpdateInput = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (newInitialPassword) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(newInitialPassword, salt);
      updateData.requiresPasswordChange = true;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, isActive: true, requiresPasswordChange: true }
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

export default router;
