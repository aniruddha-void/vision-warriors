import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types/index.js';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  shopId: string;
  isDemo?: boolean;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_nova_insights_jwt_token_key_2026';

export function extractToken(req: Request): string | null {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  if (req.cookies && req.cookies.nova_auth_token) {
    return req.cookies.nova_auth_token;
  }
  return null;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      const isExpired = err.name === 'TokenExpiredError';
      res.status(401).json({
        success: false,
        message: isExpired ? 'Authentication token has expired' : 'Invalid authentication token',
      });
      return;
    }

    if (!decoded || !decoded.id || !decoded.role || !decoded.shopId) {
      res.status(401).json({ success: false, message: 'Malformed authentication token' });
      return;
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      shopId: decoded.shopId,
      isDemo: Boolean(decoded.isDemo),
    };

    next();
  });
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user.role}' lacks permission for this resource. Required: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (!err && decoded && decoded.id && decoded.role && decoded.shopId) {
      req.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        shopId: decoded.shopId,
        isDemo: Boolean(decoded.isDemo),
      };
    }
    next();
  });
}

export function getTenantShopId(req: AuthRequest): string {
  return req.user?.shopId || 'chai-and-co';
}

