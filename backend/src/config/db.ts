import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nova_insights';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri);
    console.log(`[Database] MongoDB connected successfully to: ${uri}`);
  } catch (error) {
    console.error('[Database] MongoDB connection error:', error);
    console.warn('[Database] Note: Ensure MongoDB server is active.');
  }
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
