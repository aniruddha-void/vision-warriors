import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config, validateEnv } from './config/env.js';
import { connectDB } from './config/db.js';
import apiRouter from './routes/api.js';
import { CustomerModel } from './models/Customer.js';
import { seedDatabase } from './controllers/miscController.js';

// Validate environment variables on startup
validateEnv();

const app = express();
const PORT = config.PORT;

// Security & Parsing Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (mobile apps, server-to-server, curl)
      if (!origin) return callback(null, true);

      // In development or test, allow all origins
      if (!config.IS_PRODUCTION) {
        return callback(null, true);
      }

      // In production, enforce whitelist (FRONTEND_URL & ALLOWED_ORIGINS)
      const isAllowed = config.ALLOWED_ORIGINS.some(
        (allowed) => allowed === origin || allowed === origin.replace(/\/+$/, '')
      );

      if (isAllowed) {
        return callback(null, true);
      }

      console.warn(`[CORS Blocked] Origin not allowed: ${origin}`);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging in dev
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api', apiRouter);

// Root route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'Nova Insights Backend API',
    description: 'Privacy-first automated customer engagement, segmentation & analytics platform',
    docs: '/api/health',
  });
});

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Global Error Handler
interface HttpError extends Error {
  status?: number;
  statusCode?: number;
}

app.use((err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Unhandled Error]:', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Initialize Server & Database
async function startServer() {
  await connectDB();

  // Auto-seed if database is brand new
  try {
    const customerCount = await CustomerModel.countDocuments();
    if (customerCount === 0) {
      console.log('[Init] Fresh database detected. Auto-seeding initial records...');
      await seedDatabase();
    }
  } catch (err) {
    console.warn('[Init] Could not check/seed database:', err);
  }

  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Nova Insights Server running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`👥 Customers API: http://localhost:${PORT}/api/customers`);
    console.log(`📱 QR Check-In: http://localhost:${PORT}/api/checkin`);
    console.log(`=========================================`);
  });
}

startServer();
