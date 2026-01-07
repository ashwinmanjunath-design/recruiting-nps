import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { UserRole, Permission, ROLE_PERMISSIONS } from '../../../shared/types/enums';

/**
 * Middleware to check if user has required permission
 */
export const requirePermission = (...permissions: Permission[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userPermissions = ROLE_PERMISSIONS[user.role];
    const hasPermission = permissions.some((p) =>
      userPermissions.includes(p)
    );

    if (!hasPermission) {
      return res.status(403).json({
        error: 'Forbidden: Insufficient permissions',
        required: permissions,
        userRole: user.role,
      });
    }

    next();
  };
};

/**
 * Middleware to check if user has required role
 */
export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({
        error: 'Forbidden: Insufficient role',
        required: roles,
        userRole: user.role,
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = requireRole(UserRole.ADMIN);

/**
 * Check if user can manage users
 */
export const canManageUsers = requirePermission(Permission.MANAGE_USERS);

/**
 * Check if user can manage integrations
 */
export const canManageIntegrations = requirePermission(
  Permission.MANAGE_INTEGRATIONS
);

/**
 * Check if user can manage imports
 */
export const canManageImports = requirePermission(Permission.MANAGE_IMPORTS);

/**
 * Check if user can manage surveys
 */
export const canManageSurveys = requirePermission(Permission.MANAGE_SURVEYS);

/**
 * Check if user can view admin section
 */
export const canViewAdmin = requirePermission(Permission.VIEW_ADMIN);

