import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../../../shared/types/enums';
import { secureLogger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    name: string;
    role: UserRole;
  };
}

/**
 * Hardened authentication middleware
 * - Rejects missing tokens
 * - Rejects expired tokens
 * - Rejects tampered tokens
 * - Requires JWT_SECRET (no defaults)
 */
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Require JWT_SECRET to be set
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || jwtSecret === 'secret' || jwtSecret === 'your-secret-key') {
      secureLogger.error('JWT_SECRET not configured or using default value');
      return res.status(500).json({ error: 'Authentication configuration error' });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      secureLogger.warn('Authentication attempt without token', { path: req.path, ip: req.ip });
      return res.status(401).json({ error: 'No token provided' });
    }

    // Validate Authorization header format: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      secureLogger.warn('Invalid token format', { path: req.path, ip: req.ip });
      return res.status(401).json({ error: 'Invalid token format. Expected: Bearer <token>' });
    }

    const token = parts[1];

    if (!token || token.length < 10) {
      secureLogger.warn('Token too short or empty', { path: req.path, ip: req.ip });
      return res.status(401).json({ error: 'Invalid token format' });
    }

    // Verify token - this will throw if expired, tampered, or invalid
    let decoded: any;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        secureLogger.warn('Expired token attempt', { path: req.path, ip: req.ip });
        return res.status(401).json({ error: 'Token expired' });
      }
      if (error.name === 'JsonWebTokenError') {
        secureLogger.warn('Invalid token signature', { path: req.path, ip: req.ip });
        return res.status(401).json({ error: 'Invalid token' });
      }
      throw error;
    }

    // Validate decoded payload structure
    if (!decoded.userId || !decoded.email || !decoded.role) {
      secureLogger.warn('Token missing required fields', { path: req.path, ip: req.ip });
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name || 'Unknown',
      role: decoded.role,
    };

    next();
  } catch (error: any) {
    secureLogger.error('Authentication middleware error', { error: error.message, path: req.path });
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

