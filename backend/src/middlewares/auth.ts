import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/AppError';
import { User } from '../models';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload & { banned?: boolean };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    // Check if user is banned
    const user = await User.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (user.banned) {
      throw new ForbiddenError(`Account banned: ${user.bannedReason || 'Contact support'}`);
    }

    // Attach user to request
    req.user = { ...payload, banned: user.banned };
    next();
  } catch (error) {
    next(error);
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ForbiddenError('Admin access required'));
  }
  next();
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);
      req.user = payload;
    }
  } catch (error) {
    // Ignore errors for optional auth
  }
  next();
};
