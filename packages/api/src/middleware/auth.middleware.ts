import { Request, Response, NextFunction } from 'express';
import { verifyToken, getUserById } from '../services/auth.service.js';
import { User, UserRole } from '@prisma/client';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: string;
    }
  }
}

// Authenticate user from JWT token
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'ავტორიზაცია საჭიროა' },
    });
    return;
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'არასწორი ტოკენი' },
    });
    return;
  }

  const user = await getUserById(payload.userId);

  if (!user || !user.isActive) {
    res.status(401).json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'მომხმარებელი ვერ მოიძებნა' },
    });
    return;
  }

  req.user = user;
  req.userId = user.id;
  next();
}

// Optional authentication (doesn't fail if no token)
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (payload) {
    const user = await getUserById(payload.userId);
    if (user && user.isActive) {
      req.user = user;
      req.userId = user.id;
    }
  }

  next();
}

// Require specific role(s)
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'ავტორიზაცია საჭიროა' },
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'წვდომა აკრძალულია' },
      });
      return;
    }

    next();
  };
}

// Require driver role
export const requireDriver = requireRole(UserRole.DRIVER, UserRole.ADMIN);

// Require restaurant admin role
export const requireRestaurantAdmin = requireRole(UserRole.RESTAURANT_ADMIN, UserRole.ADMIN);

// Require admin role
export const requireAdmin = requireRole(UserRole.ADMIN);
