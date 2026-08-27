import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { User, UserRole } from '../../src/types';

const TOKEN_SECRET = process.env.SESSION_SECRET || 'talentintel-auth-sec-2026-enterprise';

// In-memory token revocation registry
const REVOKED_TOKENS = new Set<string>();

export function revokeToken(token: string) {
  if (token) {
    REVOKED_TOKENS.add(token);
    // Cleanup if set grows too large
    if (REVOKED_TOKENS.size > 10000) {
      REVOKED_TOKENS.clear();
    }
  }
}

export function isTokenRevoked(token: string): boolean {
  return REVOKED_TOKENS.has(token);
}

export interface AuthenticatedRequest extends Request {
  user?: User;
  orgId?: string;
  rawToken?: string;
}

export function generateToken(user: User): string {
  const payload = {
    userId: user.id,
    email: user.email,
    orgId: user.orgId,
    role: user.role,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(payloadStr).digest('base64url');
  return `${payloadStr}.${signature}`;
}

export function verifyToken(token: string): { userId: string; email: string; orgId: string; role: UserRole } | null {
  try {
    if (isTokenRevoked(token)) return null;

    const [payloadStr, signature] = token.split('.');
    if (!payloadStr || !signature) return null;

    const expectedSignature = crypto.createHmac('sha256', TOKEN_SECRET).update(payloadStr).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf-8'));
    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || (req.headers['x-auth-token'] as string);
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (authHeader) {
    token = String(authHeader).trim();
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No session token provided in Authorization header.' });
  }

  if (isTokenRevoked(token)) {
    return res.status(401).json({ error: 'Session has been invalidated. Please log in again.' });
  }

  const verified = verifyToken(token);
  if (!verified) {
    return res.status(401).json({ error: 'Invalid or expired session token. Please log in again.' });
  }

  const user = db.getUserById(verified.userId);
  if (!user) {
    return res.status(401).json({ error: 'User session invalid. Account not found.' });
  }

  req.user = user;
  req.orgId = user.orgId;
  req.rawToken = token;
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Role '${req.user.role}' is not authorized for this operation. Required: [${allowedRoles.join(', ')}]`,
      });
    }

    next();
  };
}
