import mongoose from 'mongoose';
import config from './index';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;

// Serverless variant (used by api/index.ts): reuses a live connection across
// invocations, never exits the process, and fails fast when the DB is unreachable.
let connecting: Promise<unknown> | undefined;

export const ensureDBConnection = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) return;
  connecting ??= mongoose
    .connect(config.mongoUri, { serverSelectionTimeoutMS: 8000, maxPoolSize: 5 })
    .finally(() => {
      connecting = undefined;
    });
  await connecting;
};
