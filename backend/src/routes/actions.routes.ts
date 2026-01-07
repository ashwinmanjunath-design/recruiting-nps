import { Router } from 'express';
import { PrismaClient, SurveyAudience } from '@prisma/client';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { Permission } from '../../../shared/types/enums';
import { sanitizeString } from '../utils/validation';
import { secureLogger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Valid audience values for validation
const VALID_AUDIENCES = ['CANDIDATE', 'HIRING_MANAGER', 'WORKPLACE', 'IT_SUPPORT'] as const;

/**
 * Parse and validate audience parameter from query string
 * Defaults to CANDIDATE if not provided or invalid
 */
function parseAudience(audienceParam: string | undefined): SurveyAudience {
  if (!audienceParam) return 'CANDIDATE';
  const upper = audienceParam.toUpperCase();
  if (VALID_AUDIENCES.includes(upper as any)) {
    return upper as SurveyAudience;
  }
  return 'CANDIDATE';
}

router.use(authMiddleware);
router.use(requirePermission(Permission.VIEW_ACTIONS));

// Validation schemas with sanitization
const actionCreateSchema = z.object({
  title: z.string().min(1).max(200).transform(sanitizeString),
  description: z.string().max(2000).optional().transform((val) => val ? sanitizeString(val) : undefined),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  assignedTo: z.string().max(100).optional().transform((val) => val ? sanitizeString(val) : undefined),
  dueDate: z.string().datetime().optional(),
  themeId: z.string().uuid().optional(),
  audience: z.enum(['CANDIDATE', 'HIRING_MANAGER', 'WORKPLACE', 'IT_SUPPORT']).default('CANDIDATE'),
  location: z.string().max(100).optional().transform((val) => val ? sanitizeString(val) : undefined),
  department: z.string().max(100).optional().transform((val) => val ? sanitizeString(val) : undefined),
});

const actionUpdateSchema = z.object({
  title: z.string().min(1).max(200).transform(sanitizeString).optional(),
  description: z.string().max(2000).optional().transform((val) => val ? sanitizeString(val) : undefined),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  assignedTo: z.string().max(100).optional().transform((val) => val ? sanitizeString(val) : undefined),
  dueDate: z.string().datetime().optional()
});

// GET /api/actions
// Query params: ?audience=CANDIDATE|HIRING_MANAGER|WORKPLACE|IT_SUPPORT&status=...&priority=...
router.get('/', async (req, res) => {
  try {
    const { status, priority, assignedTo, audience: audienceParam } = req.query;
    const audience = parseAudience(audienceParam as string);

    const where: any = { audience }; // Always filter by audience
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedTo = assignedTo;

    // Add limit to prevent unbounded queries
    const actions = await prisma.actionItem.findMany({
      where,
      take: 1000, // Limit results
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        theme: true
      }
    });

    res.json({
      audience,
      actions: actions.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        priority: a.priority,
        status: a.status,
        assignedTo: a.assignedTo,
        dueDate: a.dueDate,
        audience: (a as any).audience,
        location: (a as any).location,
        department: (a as any).department,
        createdBy: a.creator,
        theme: a.theme ? {
          id: a.theme.id,
          theme: a.theme.theme,
          sentiment: a.theme.sentiment
        } : null,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt
      }))
    });
  } catch (error) {
    console.error('Actions list error:', error);
    res.status(500).json({ error: 'Failed to fetch actions' });
  }
});

// GET /api/actions/themes
router.get('/themes', async (req, res) => {
  try {
    // Limit themes to prevent unbounded queries
    const themes = await prisma.feedbackTheme.findMany({
      orderBy: { count: 'desc' },
      take: 100 // Limit results
    });

    const positive = themes.filter(t => t.sentiment === 'POSITIVE');
    const negative = themes.filter(t => t.sentiment === 'NEGATIVE');

    res.json({
      positive: positive.map(t => ({
        id: t.id,
        theme: t.theme,
        count: t.count,
        category: t.category
      })),
      negative: negative.map(t => ({
        id: t.id,
        theme: t.theme,
        count: t.count,
        category: t.category
      }))
    });
  } catch (error) {
    console.error('Actions themes error:', error);
    res.status(500).json({ error: 'Failed to fetch themes' });
  }
});

// GET /api/actions/history
router.get('/history', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const history = await prisma.actionItem.findMany({
      orderBy: { updatedAt: 'desc' },
      take: parseInt(limit as string, 10),
      include: {
        creator: {
          select: { name: true }
        }
      }
    });

    res.json({
      history: history.map(h => ({
        id: h.id,
        title: h.title,
        status: h.status,
        updatedAt: h.updatedAt,
        updatedBy: h.creator?.name
      }))
    });
  } catch (error) {
    console.error('Actions history error:', error);
    res.status(500).json({ error: 'Failed to fetch action history' });
  }
});

// POST /api/actions
router.post('/', requirePermission(Permission.MANAGE_ACTIONS), async (req: AuthRequest, res) => {
  try {
    const data = actionCreateSchema.parse(req.body);

    const action = await prisma.actionItem.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        assignedTo: data.assignedTo,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        createdById: req.user!.userId,
        themeId: data.themeId,
        status: 'PENDING'
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json({ action });
  } catch (error: any) {
    console.error('Create action error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to create action' });
  }
});

// PATCH /api/actions/:id
router.patch('/:id', requirePermission(Permission.MANAGE_ACTIONS), async (req, res) => {
  try {
    const { id } = req.params;
    const data = actionUpdateSchema.parse(req.body);

    const action = await prisma.actionItem.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.priority && { priority: data.priority }),
        ...(data.status && { status: data.status }),
        ...(data.assignedTo !== undefined && { assignedTo: data.assignedTo }),
        ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
        updatedAt: new Date()
      }
    });

    res.json({ action });
  } catch (error: any) {
    console.error('Update action error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to update action' });
  }
});

// DELETE /api/actions/:id
router.delete('/:id', requirePermission(Permission.MANAGE_ACTIONS), async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.actionItem.delete({
      where: { id }
    });

    res.json({ message: 'Action deleted successfully' });
  } catch (error) {
    console.error('Delete action error:', error);
    res.status(500).json({ error: 'Failed to delete action' });
  }
});

export default router;

