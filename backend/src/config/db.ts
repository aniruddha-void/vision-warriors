import mongoose from 'mongoose';
import { config } from './env.js';

export async function connectDB(): Promise<void> {
  const uri = config.MONGODB_URI;
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri);
    const host = mongoose.connection.host || 'cluster';
    const dbName = mongoose.connection.name || 'nova_insights';
    console.log(`[Database] MongoDB connected successfully to host: ${host} (db: ${dbName})`);
  } catch (error) {
    console.error('[Database] MongoDB connection error:', error);
    console.warn('[Database] Note: Ensure MongoDB server is active.');
  }
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
