import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';
import trendsRoutes from './routes/trends.routes';
import cohortsRoutes from './routes/cohorts.routes';
import geographicRoutes from './routes/geographic.routes';
import actionsRoutes from './routes/actions.routes';
import surveysRoutes from './routes/surveys.routes';
import adminRoutes from './routes/admin.routes';
import testRoutes from './routes/test.routes';
import surveyResponseRoutes from './routes/survey-response.routes';
import { validateEnvironment } from './utils/env.validation';
import { apiRateLimiter } from './middleware/rateLimiter.middleware';
import { secureLogger } from './utils/logger';

dotenv.config();

// Validate environment variables on startup - fail fast if secrets are missing
try {
  validateEnvironment();
  secureLogger.info('Environment validation passed');
} catch (error: any) {
  console.error('❌ Environment validation failed:', error.message);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 4000;

// Trust proxy when behind a reverse proxy (Render, Heroku, etc.)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding if needed
}));

// CORS - Allow frontend origin with fallbacks for different dev ports
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = [
  frontendUrl,
  'https://recruiting-nps.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:5178',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    // Allow any Vercel preview/production URL
    if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// General API rate limiting
app.use('/api', apiRateLimiter);

// Secure request logging
app.use((req, res, next) => {
  secureLogger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/trends', trendsRoutes);
app.use('/api/cohorts', cohortsRoutes);
app.use('/api/geographic', geographicRoutes);
app.use('/api/actions', actionsRoutes);
app.use('/api/survey-management', surveysRoutes);
app.use('/api/surveys', surveysRoutes); // Also mount at /api/surveys for send endpoint
app.use('/api/survey-response', surveyResponseRoutes); // Public endpoint for survey submissions
app.use('/api/admin', adminRoutes);

// Test routes (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/test', testRoutes);
}

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;

