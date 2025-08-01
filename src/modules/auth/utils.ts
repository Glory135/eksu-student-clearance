import { cookies as getCookies } from "next/headers";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { User } from '@/payload-types';

interface Props {
  prefix: string
  value: string
}

interface TokenPayload {
  userId: string;
  email: string;
  type: string;
  role: string;
}

export const generateAuthCookies = async ({ prefix, value }: Props) => {
  const cookies = await getCookies();
  cookies.set({
    name: `${prefix}-token`,
    value,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

// Generate JWT token for magic links and password resets
export const generateToken = (payload: TokenPayload, expiresIn: string = '24h'): string => {
  const secret = process.env.JWT_SECRET || process.env.PAYLOAD_SECRET || 'fallback-secret';
  return jwt.sign(payload, secret as jwt.Secret, { expiresIn } as jwt.SignOptions);
};

// Verify JWT token
export const verifyToken = (token: string): JwtPayload => {
  try {
    const secret = process.env.JWT_SECRET || process.env.PAYLOAD_SECRET || 'fallback-secret';
    return jwt.verify(token, secret as jwt.Secret) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Generate magic link token for password setup
export const generateMagicLinkToken = (user: User): string => {
  return generateToken({
    userId: user.id,
    email: user.email,
    type: 'magic-link',
    role: user.role
  }, '24h');
};

// Generate password reset token
export const generatePasswordResetToken = (user: User): string => {
  return generateToken({
    userId: user.id,
    email: user.email,
    type: 'password-reset',
    role: user.role
  }, '1h');
};

// Clear auth cookies
export const clearAuthCookies = async (prefix: string) => {
  const cookies = await getCookies();
  cookies.delete(`${prefix}-token`);
};

// Get user from token
export const getUserFromToken = async (token: string, payload: any): Promise<User | null> => {
  try {
    const decoded = verifyToken(token);

    if (decoded.type === 'magic-link' || decoded.type === 'password-reset') {
      const user = await payload.findByID({
        collection: 'users',
        id: decoded.userId,
      });
      return user;
    }

    return null;
  } catch (error) {
    return null;
  }
};