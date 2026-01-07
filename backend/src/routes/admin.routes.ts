import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import multer from 'multer';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { Permission, UserRole } from '../../../shared/types/enums';
import { queues } from '../jobs/queue.config';
import { validateFileType, validateFileSize, sanitizeString } from '../utils/validation';
import { secureLogger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// File upload configuration with validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['csv', 'xls', 'xlsx'];

const upload = multer({
  dest: 'uploads/temp/',
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    // Validate file type
    if (!validateFileType(file.originalname, ALLOWED_FILE_TYPES)) {
      return cb(new Error(`Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`));
    }
    cb(null, true);
  },
});

router.use(authMiddleware);

// User Management Routes
const userCreateSchema = z.object({
  email: z.string().email().transform((val) => val.toLowerCase().trim()),
  name: z.string().min(2).max(200).transform(sanitizeString),
  role: z.nativeEnum(UserRole),
  password: z.string().min(8).max(100).optional() // Require minimum 8 characters
});

const userUpdateSchema = z.object({
  name: z.string().min(2).max(200).transform(sanitizeString).optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional()
});

// GET /api/admin/users
router.get('/users', requirePermission(Permission.MANAGE_USERS), async (req, res) => {
  try {
    // Add limit to prevent unbounded queries
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1000, // Limit results
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        invitedBy: true,
        invitedAt: true
      }
    });

    res.json({ users });
  } catch (error) {
    console.error('Users list error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/admin/users
router.post('/users', requirePermission(Permission.MANAGE_USERS), async (req: AuthRequest, res) => {
  try {
    const data = userCreateSchema.parse(req.body);

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Generate temporary password if not provided
    const password = data.password || Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role,
        password: hashedPassword,
        invitedBy: req.user!.userId,
        invitedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    // TODO: Send invitation email with temporary password

    res.status(201).json({ user, temporaryPassword: password });
  } catch (error: any) {
    console.error('Create user error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PATCH /api/admin/users/:id
router.patch('/users/:id', requirePermission(Permission.MANAGE_USERS), async (req, res) => {
  try {
    const { id } = req.params;
    const data = userUpdateSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.role && { role: data.role }),
        ...(data.isActive !== undefined && { isActive: data.isActive })
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    });

    res.json({ user });
  } catch (error: any) {
    console.error('Update user error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', requirePermission(Permission.MANAGE_USERS), async (req, res) => {
  try {
    const { id } = req.params;

    // Don't allow deleting yourself
    if (id === (req as AuthRequest).user!.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await prisma.user.delete({ where: { id } });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Integration Routes

// GET /api/admin/integrations
router.get('/integrations', requirePermission(Permission.MANAGE_INTEGRATIONS), async (req, res) => {
  try {
    const integrations = await prisma.integrationConfig.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      integrations: integrations.map(i => ({
        id: i.id,
        provider: i.provider,
        isActive: i.isActive,
        lastSyncAt: i.lastSyncAt,
        createdAt: i.createdAt
      }))
    });
  } catch (error) {
    console.error('Integrations list error:', error);
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
});

// POST /api/admin/integrations/smartrecruiters
router.post('/integrations/smartrecruiters', requirePermission(Permission.MANAGE_INTEGRATIONS), async (req, res) => {
  try {
    const { apiKey, baseUrl } = req.body;

    if (!apiKey || !baseUrl) {
      return res.status(400).json({ error: 'API key and base URL are required' });
    }

    // TODO: Encrypt API key before storing
    const integration = await prisma.integrationConfig.upsert({
      where: { provider: 'SMARTRECRUITERS' },
      update: {
        config: JSON.stringify({ apiKey, baseUrl }),
        isActive: true
      },
      create: {
        provider: 'SMARTRECRUITERS',
        config: JSON.stringify({ apiKey, baseUrl }),
        isActive: true
      }
    });

    res.json({ integration: { id: integration.id, provider: integration.provider } });
  } catch (error) {
    console.error('Save SmartRecruiters config error:', error);
    res.status(500).json({ error: 'Failed to save integration' });
  }
});

// POST /api/admin/integrations/smartrecruiters/sync
router.post('/integrations/smartrecruiters/sync', requirePermission(Permission.MANAGE_INTEGRATIONS), async (req, res) => {
  try {
    // Queue sync job
    await queues.srSync.add('manual-sync', { manual: true });

    res.json({ message: 'Sync started successfully' });
  } catch (error) {
    console.error('Trigger sync error:', error);
    res.status(500).json({ error: 'Failed to trigger sync' });
  }
});

// Import Routes

// GET /api/admin/imports
router.get('/imports', requirePermission(Permission.MANAGE_IMPORTS), async (req, res) => {
  try {
    const imports = await prisma.importJob.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { errors: true }
        }
      },
      take: 50
    });

    res.json({
      imports: imports.map(i => ({
        id: i.id,
        fileName: i.fileName,
        importType: i.importType,
        status: i.status,
        totalRows: i.totalRows,
        successRows: i.successRows,
        errorCount: i._count.errors,
        createdAt: i.createdAt,
        completedAt: i.completedAt
      }))
    });
  } catch (error) {
    console.error('Imports list error:', error);
    res.status(500).json({ error: 'Failed to fetch imports' });
  }
});

// POST /api/admin/imports/upload
router.post('/imports/upload', requirePermission(Permission.MANAGE_IMPORTS), upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file size
    if (!validateFileSize(req.file.size, MAX_FILE_SIZE)) {
      secureLogger.warn('File upload rejected - size exceeded', {
        size: req.file.size,
        maxSize: MAX_FILE_SIZE,
        userId: req.user?.userId,
        ip: req.ip,
      });
      return res.status(400).json({ error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB` });
    }

    // Validate file type
    if (!validateFileType(req.file.originalname, ALLOWED_FILE_TYPES)) {
      secureLogger.warn('File upload rejected - invalid type', {
        filename: req.file.originalname,
        userId: req.user?.userId,
        ip: req.ip,
      });
      return res.status(400).json({ error: `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}` });
    }

    const { importType } = req.body;

    if (!importType || !['CANDIDATES', 'SURVEY_RESPONSES', 'COHORTS'].includes(importType)) {
      return res.status(400).json({ error: 'Invalid import type' });
    }

    secureLogger.info('File upload accepted', {
      filename: req.file.originalname,
      size: req.file.size,
      importType,
      userId: req.user?.userId,
    });

    // Create import job
    const importJob = await prisma.importJob.create({
      data: {
        fileName: req.file.originalname,
        importType,
        filePath: req.file.path,
        status: 'PENDING',
        totalRows: 0,
        successRows: 0
      }
    });

    // Queue processing
    await queues.bulkImport.add('process-import', {
      importJobId: importJob.id,
      filePath: req.file.path,
      importType
    });

    res.status(202).json({
      message: 'File uploaded and queued for processing',
      importJobId: importJob.id
    });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// GET /api/admin/imports/:id
router.get('/imports/:id', requirePermission(Permission.MANAGE_IMPORTS), async (req, res) => {
  try {
    const { id } = req.params;

    const importJob = await prisma.importJob.findUnique({
      where: { id },
      include: {
        errors: {
          take: 100,
          orderBy: { rowNumber: 'asc' }
        }
      }
    });

    if (!importJob) {
      return res.status(404).json({ error: 'Import job not found' });
    }

    res.json({
      import: {
        id: importJob.id,
        fileName: importJob.fileName,
        importType: importJob.importType,
        status: importJob.status,
        totalRows: importJob.totalRows,
        successRows: importJob.successRows,
        createdAt: importJob.createdAt,
        completedAt: importJob.completedAt,
        errors: importJob.errors.map(e => ({
          rowNumber: e.rowNumber,
          field: e.field,
          errorMessage: e.errorMessage
        }))
      }
    });
  } catch (error) {
    console.error('Get import details error:', error);
    res.status(500).json({ error: 'Failed to fetch import details' });
  }
});

export default router;

