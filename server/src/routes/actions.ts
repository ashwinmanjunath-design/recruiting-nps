import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';

const router = Router();

// GET /api/actions
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, priority, assignedTo } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedTo = assignedTo;

    const actions = await prisma.actionItem.findMany({
      where,
      orderBy: [
        { priority: 'asc' }, // HIGH first
        { createdAt: 'desc' }
      ]
    });

    res.json(actions);
  } catch (error) {
    console.error('Actions list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/actions/themes
router.get('/themes', async (req: Request, res: Response) => {
  try {
    const positiveThemes = await prisma.feedbackTheme.findMany({
      where: { category: 'POSITIVE' },
      orderBy: { count: 'desc' },
      take: 10
    });

    const negativeThemes = await prisma.feedbackTheme.findMany({
      where: { category: 'NEGATIVE' },
      orderBy: { count: 'desc' },
      take: 10
    });

    res.json({
      positive: positiveThemes,
      negative: negativeThemes
    });
  } catch (error) {
    console.error('Actions themes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/actions
const createActionSchema = z.object({
  title: z.string().min(3),
  description: z.string(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  assignedTo: z.string().optional(),
  sourceInsight: z.string().optional(),
  linkedTheme: z.string().optional(),
  dueDate: z.string().optional()
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const data = createActionSchema.parse(req.body);

    const action = await prisma.actionItem.create({
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined
      }
    });

    res.status(201).json(action);
  } catch (error: any) {
    console.error('Create action error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/actions/:id
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, completedAt } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (completedAt) updateData.completedAt = new Date(completedAt);
    if (status === 'COMPLETED' && !completedAt) {
      updateData.completedAt = new Date();
    }

    const action = await prisma.actionItem.update({
      where: { id },
      data: updateData
    });

    res.json(action);
  } catch (error) {
    console.error('Update action error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/actions/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.actionItem.delete({
      where: { id }
    });

    res.json({ message: 'Action deleted successfully' });
  } catch (error) {
    console.error('Delete action error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/actions/history
router.get('/history', async (req: Request, res: Response) => {
  try {
    const { limit = 20 } = req.query;

    const history = await prisma.actionItem.findMany({
      orderBy: { updatedAt: 'desc' },
      take: parseInt(limit as string)
    });

    const formatted = history.map(h => ({
      id: h.id,
      message: `${h.assignedTo || 'System'} changed status of "${h.title}" to "${h.status}"`,
      timestamp: h.updatedAt,
      action: h
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Actions history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

