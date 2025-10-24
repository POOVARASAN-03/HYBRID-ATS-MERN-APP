import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cron from 'node-cron';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the backend directory
dotenv.config({ path: join(__dirname, '../.env') });

// Set environment variables if not loaded
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'your_jwt_secret_key_here_change_in_production';
}
if (!process.env.INTERNAL_BOT_TOKEN) {
  process.env.INTERNAL_BOT_TOKEN = 'bot_secret_token_here_change_in_production';
}
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/interview-tracker';
}

// Debug environment variables
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

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
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

// Error handling middleware
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
const runBotAutomation = async () => {
  try {
    console.log('🤖 Running scheduled bot automation...');
    
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

// Schedule bot automation to run every 30 minutes
cron.schedule('*/30 * * * *', () => {
  console.log('⏰ Bot automation scheduled run triggered');
  runBotAutomation();
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/interview-tracker');
    console.log('✅ Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🤖 Bot automation scheduled every 30 minutes`);
      
      // Run bot automation once on startup for demo purposes
      setTimeout(() => {
        console.log('🔄 Running initial bot automation...');
        runBotAutomation();
      }, 5000);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await mongoose.connection.close();
  console.log('✅ Database connection closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  await mongoose.connection.close();
  console.log('✅ Database connection closed');
  process.exit(0);
});

startServer();
