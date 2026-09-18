import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

export function generateToken(payload: any) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}

// Middleware to authenticate user via HTTP-only cookie
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const user = verifyToken(token) as any;
    // Attach user payload to request
    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

// Middleware to require specific role
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
}
