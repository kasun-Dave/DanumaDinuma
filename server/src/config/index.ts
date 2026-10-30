import dotenv from 'dotenv';
dotenv.config();

// Validate required env vars in production
function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] || fallback;
  if (!value && process.env.NODE_ENV === 'production') {
    throw new Error(`❌ Missing required environment variable: ${name}`);
  }
  return value || '';
}

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: requireEnv('MONGO_URI', 'mongodb://localhost:27017/danumadinuma'),
  jwtSecret: requireEnv('JWT_SECRET', process.env.NODE_ENV === 'production' ? undefined : 'dev-fallback-secret'),
  jwtRefreshSecret: requireEnv('JWT_REFRESH_SECRET', process.env.NODE_ENV === 'production' ? undefined : 'dev-fallback-refresh-secret'),
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  },
  frontendUrl: requireEnv('FRONTEND_URL', 'http://localhost:5173'),
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  aiProvider: process.env.AI_PROVIDER || 'mock',
};

export default config;
