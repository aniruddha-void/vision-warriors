import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { seedDatabase } from '../controllers/miscController.js';
import mongoose from 'mongoose';

dotenv.config();

async function run() {
  await connectDB();
  console.log('[Seed Script] Starting manual database seeding...');
  await seedDatabase();
  console.log('[Seed Script] Seeding complete.');
  await mongoose.disconnect();
  process.exit(0);
}

run();
