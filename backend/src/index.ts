import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import apiRouter from './routes/api.js';
import { CustomerModel } from './models/Customer.js';
import { seedDatabase } from './controllers/miscController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: '*',
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
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Unhandled Error]:', err);
  res.status(err.status || 500).json({
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
