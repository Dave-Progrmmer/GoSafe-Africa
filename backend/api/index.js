import app from '../dist/index.js';
import { connectDB } from '../dist/config/database.js';

// Connect to MongoDB on each invocation (with caching)
export default async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
};
