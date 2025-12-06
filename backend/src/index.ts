import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

console.log('🔧 Environment:', process.env.NODE_ENV);
console.log('🔧 MongoDB URI configured:', !!process.env.MONGODB_URI);
console.log('🔧 JWT Secret configured:', !!process.env.JWT_SECRET);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'GoSafe Africa API is running',
    timestamp: new Date().toISOString()
  });
});

// Import routes
import authRoutes from './routes/auth.routes';
import reportRoutes from './routes/report.routes';

// Mount API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/reports', reportRoutes);

// 404 handler (Express 5 compatible)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});


// Error handler (must be last)
app.use(errorHandler);

// Export app for Vercel
export default app;

// Start server (only in local/non-serverless)
if (process.env.VERCEL !== '1') {
  const startServer = async () => {
    try {
      await connectDB();
      
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  };

  startServer();
}
