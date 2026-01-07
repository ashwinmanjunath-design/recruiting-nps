import { Router } from 'express';
import { z } from 'zod';
import authService from '../services/auth.service';
import { UserRole } from '../../../shared/types/enums';
import { authRateLimiter } from '../middleware/rateLimiter.middleware';
import { secureLogger } from '../utils/logger';

const router = Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.nativeEnum(UserRole).optional()
});

const refreshSchema = z.object({
  refreshToken: z.string()
});

// POST /api/auth/login - Rate limited to prevent brute force
router.post('/login', authRateLimiter, async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    const result = await authService.login(email, password);
    
    res.json(result);
  } catch (error: any) {
    secureLogger.warn('Login attempt failed', {
      email: req.body.email,
      ip: req.ip,
      error: error.message,
    });
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    
    res.status(401).json({ error: 'Invalid email or password' }); // Don't reveal which field failed
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    
    const result = await authService.register(data);
    
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Register error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    
    res.status(400).json({ error: error.message || 'Registration failed' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    
    const result = await authService.refresh(refreshToken);
    
    res.json(result);
  } catch (error: any) {
    console.error('Refresh error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    
    res.status(401).json({ error: error.message || 'Token refresh failed' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    
    await authService.logout(refreshToken);
    
    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    const user = await authService.verifyToken(token);
    
    res.json({ user });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(401).json({ error: error.message || 'Authentication failed' });
  }
});

export default router;

