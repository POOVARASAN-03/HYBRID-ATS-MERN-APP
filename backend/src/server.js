import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env (backend/.env) as early as possible
const dotenvResult = dotenv.config({ path: join(__dirname, '../.env') });

console.log('MONGODB_URI (env):', process.env.MONGODB_URI);
console.log('JWT_SECRET (env):', process.env.JWT_SECRET);

// Debug
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Loaded' : 'NOT LOADED');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Loaded' : 'NOT LOADED');

// Import routes
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import applicationRoutes from './routes/applications.js';
import adminRoutes from './routes/admin.js';
import botRoutes from './routes/bot.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Interview Tracker API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bot', botRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Bot automation function
export const runBotAutomation = async () => {
  try {
    console.log('🤖 Running bot automation...');
    const response = await axios.post(`${process.env.API_BASE_URL || 'http://localhost:5000'}/api/bot/run`, {}, {
      headers: {
        'X-Bot-Token': process.env.INTERNAL_BOT_TOKEN
      }
    });
    console.log('✅ Bot automation completed:', response.data);
  } catch (error) {
    console.error('❌ Bot automation failed:', error.message);
  }
};

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    // Fail fast if MONGODB_URI is not provided. Do NOT default to localhost here.
    if (!process.env.MONGODB_URI) {
      console.error('\n❌ MONGODB_URI is not set.');
      console.error('Please create a `backend/.env` (use `env.example`) and set `MONGODB_URI` to your MongoDB connection string.');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    app.listen(PORT, async() => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      if (process.env.RUN_BOT_ON_STARTUP === 'true') {
        console.log('🔄 Running initial bot automation...');
        await runBotAutomation();
        process.env.RUN_BOT_ON_STARTUP = 'false'; // Prevent re-running on restarts
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down server...`);
  await mongoose.connection.close();
  console.log('✅ Database connection closed');
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Start server
startServer();
