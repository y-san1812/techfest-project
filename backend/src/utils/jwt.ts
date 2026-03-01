import jwt, { type SignOptions } from 'jsonwebtoken';
import type { JwtPayload } from '@core/types/auth';

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || 'changeme-in-production';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '1d') as SignOptions['expiresIn'];

export function signJwt(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}