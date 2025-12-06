import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_in_production';
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '30d';

export interface TokenPayload {
  userId: string;
  role: 'user' | 'admin';
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRY } as jwt.SignOptions);
};

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString('hex');
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const getRefreshTokenExpiry = (): Date => {
  // Parse expiry string (e.g., "30d" => 30 days)
  const match = JWT_REFRESH_EXPIRY.match(/^(\d+)([dhms])$/);
  if (!match) return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // default 30 days
  
  const [, value, unit] = match;
  const num = parseInt(value);
  
  const multipliers: Record<string, number> = {
    d: 24 * 60 * 60 * 1000,
    h: 60 * 60 * 1000,
    m: 60 * 1000,
    s: 1000
  };
  
  return new Date(Date.now() + num * multipliers[unit]);
};
