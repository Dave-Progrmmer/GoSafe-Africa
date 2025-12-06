import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  // Reuse existing connection in serverless
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('✅ Using existing MongoDB connection');
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gosafe-africa';
    
    // Serverless-optimized settings
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
      isConnected = false;
    });
    
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    isConnected = false;
    throw error;
  }
};
