import dotenv from 'dotenv';
import type { SignOptions } from 'jsonwebtoken';
dotenv.config();

export interface AppConfig {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: NonNullable<SignOptions['expiresIn']>;
  FRONTEND_URL: string;
  ALLOWED_ORIGINS: string[];
  EMAIL_USER?: string;
  EMAIL_PASS?: string;
  EMAIL_FROM: string;
  IS_PRODUCTION: boolean;
  IS_TEST: boolean;
}

const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
const isProduction = nodeEnv === 'production';
const isTest = nodeEnv === 'test';

// Validate environment variables safely without printing secrets
export function validateEnv(): void {
  const missing: string[] = [];

  if (isProduction) {
    if (!process.env.MONGODB_URI) {
      missing.push('MONGODB_URI');
    }
    if (!process.env.JWT_SECRET) {
      missing.push('JWT_SECRET');
    } else if (process.env.JWT_SECRET === 'super_secret_nova_insights_jwt_token_key_2026') {
      console.error(
        '\n🚨 [SECURITY WARNING] The production deployment is using an insecure default JWT_SECRET.\n' +
        'Please generate a strong random secret (e.g. `openssl rand -base64 32`) and set it in your environment.\n'
      );
    }
  }

  if (missing.length > 0) {
    const errorMsg = `[Fatal Error] Missing required production environment variables: ${missing.join(', ')}`;
    console.error(`🚨 ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // Diagnostic warning for email configuration
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    if (!isTest) {
      console.warn(
        '[Config] EMAIL_USER or EMAIL_PASS not set in environment. Outbound emails (OTP, password reset, offers) will run in simulation mode.'
      );
    }
  }
}

// Build allowed CORS origins array
function resolveAllowedOrigins(): string[] {
  const origins = new Set<string>();
  const defaultFrontend = process.env.FRONTEND_URL || 'http://localhost:5173';
  origins.add(defaultFrontend.replace(/\/+$/, ''));
  origins.add('http://localhost:5173');
  origins.add('http://localhost:3000');
  origins.add('http://127.0.0.1:5173');

  if (process.env.ALLOWED_ORIGINS) {
    process.env.ALLOWED_ORIGINS.split(',')
      .map((o) => o.trim().replace(/\/+$/, ''))
      .filter(Boolean)
      .forEach((o) => origins.add(o));
  }

  return Array.from(origins);
}

export const config: AppConfig = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: nodeEnv,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nova_insights',
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_nova_insights_jwt_token_key_2026',
  JWT_EXPIRES_IN: (process.env.JWT_EXPIRES_IN || '7d') as NonNullable<SignOptions['expiresIn']>,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  ALLOWED_ORIGINS: resolveAllowedOrigins(),
  EMAIL_USER: process.env.EMAIL_USER?.trim(),
  EMAIL_PASS: process.env.EMAIL_PASS?.trim(),
  EMAIL_FROM: process.env.EMAIL_FROM?.trim() || process.env.EMAIL_USER?.trim() || 'Nova Insights <no-reply@novainsights.com>',
  IS_PRODUCTION: isProduction,
  IS_TEST: isTest,
};
