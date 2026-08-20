import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';

// Import configs & routes
import prisma from './config/db.js';
import { seedDatabase } from './config/dbSeeder.js';
import { errorHandler } from './middleware/error.js';
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Setup environment variables
dotenv.config();

// 1. Polyfill BigInt to serialise cleanly to JSON in API responses
BigInt.prototype.toJSON = function () {
  return Number(this);
};

const app = express();
const PORT = process.env.PORT || 8081;

// 2. Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // allows serving files to the frontend
}));

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'Cache-Control'],
  exposedHeaders: ['Authorization'],
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after a minute.' }
});
app.use('/api/', limiter);

// Serve uploads folder statically
app.use('/uploads', express.static(path.resolve('uploads')));

// 3. Define endpoints mapping
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);

// Root path diagnostic
app.get('/', (req, res) => {
  res.json({ message: 'ATS Resume Analyzer Backend API is running.' });
});

// 4. Centralised error handler middleware
app.use(errorHandler);

// 5. Database Seed and Server Boot
const startServer = async () => {
  try {
    // Test Database connection
    await prisma.$connect();
    console.log('Database connection has been established successfully.');

    // Seed initial admin, company, and candidates
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start the backend server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();

export default app;
