import app from './app';
import config from './config';
import connectDB from './config/db';

const start = async () => {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`🚀 Danuma Dinuma API running on port ${config.port}`);
    console.log(`📋 Environment: ${config.nodeEnv}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
