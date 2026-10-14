import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());

const origins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header, such as Postman.
      if (!origin || origins.includes('*') || origins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Origin not allowed by CORS'));
    },
  })
);

app.use(express.json({ limit: '1mb' }));

// Limit repeated authentication attempts.
app.use(
  '/api/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Health check for local testing and deployment monitoring.
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'task-team-management-api',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Error handlers must remain last.
app.use(notFound);
app.use(errorHandler);

export default app;