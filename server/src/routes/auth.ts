import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { generateToken, authenticateToken } from '../utils/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials or inactive account' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      requiresPasswordChange: user.requiresPasswordChange
    };

    const token = generateToken(payload);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(200).json({ user: payload });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// Logout
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  const reqUser = (req as any).user;
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: reqUser.id },
      select: { id: true, email: true, name: true, role: true, isActive: true, requiresPasswordChange: true }
    });
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Change Password
router.post('/change-password', authenticateToken, async (req: Request, res: Response) => {
  const reqUser = (req as any).user;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new passwords are required' });
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({ error: 'Password does not meet the security requirements' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: reqUser.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash, requiresPasswordChange: false }
    });
    
    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error changing password' });
  }
});

export default router;
