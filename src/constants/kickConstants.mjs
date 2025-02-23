// src/constants/kickConstants.mjs
import dotenv from 'dotenv';

dotenv.config();

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';

// Base URLs
export const KICK_API_BASE_URL = isProduction
  ? process.env.KICK_API_BASE_URL_PROD
  : process.env.KICK_API_BASE_URL_DEV || 'https://api.kick.com';

export const KICK_AUTH_BASE_URL = isProduction
  ? process.env.KICK_AUTH_BASE_URL_PROD
  : process.env.KICK_AUTH_BASE_URL_DEV || 'https://id.kick.com';

// Client Credentials
export const KICK_CLIENT_ID = isProduction
  ? process.env.KICK_CLIENT_ID_PROD
  : process.env.KICK_CLIENT_ID_DEV;

export const KICK_CLIENT_SECRET = isProduction
  ? process.env.KICK_CLIENT_SECRET_PROD
  : process.env.KICK_CLIENT_SECRET_DEV;

// OAuth Callback URL
export const KICK_REDIRECT_URI = isProduction
  ? process.env.KICK_CALLBACK_URL_PROD
  : process.env.KICK_CALLBACK_URL_DEV;