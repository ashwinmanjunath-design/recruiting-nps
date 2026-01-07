// User Roles
export enum UserRole {
  ADMIN = 'ADMIN',
  ANALYST = 'ANALYST',
  RECRUITER = 'RECRUITER',
  VIEWER = 'VIEWER'
}

// Permissions
export enum Permission {
  VIEW_DASHBOARD = 'VIEW_DASHBOARD',
  VIEW_TRENDS = 'VIEW_TRENDS',
  VIEW_COHORTS = 'VIEW_COHORTS',
  VIEW_GEOGRAPHIC = 'VIEW_GEOGRAPHIC',
  VIEW_ACTIONS = 'VIEW_ACTIONS',
  VIEW_SURVEYS = 'VIEW_SURVEYS',
  MANAGE_SURVEYS = 'MANAGE_SURVEYS',
  MANAGE_ACTIONS = 'MANAGE_ACTIONS',
  MANAGE_COHORTS = 'MANAGE_COHORTS',
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_INTEGRATIONS = 'MANAGE_INTEGRATIONS',
  MANAGE_IMPORTS = 'MANAGE_IMPORTS',
  VIEW_ADMIN = 'VIEW_ADMIN'
}

// Permission matrix
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: Object.values(Permission),
  [UserRole.ANALYST]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_TRENDS,
    Permission.VIEW_COHORTS,
    Permission.VIEW_GEOGRAPHIC,
    Permission.VIEW_ACTIONS,
    Permission.VIEW_SURVEYS,
    Permission.MANAGE_SURVEYS,
    Permission.MANAGE_COHORTS,
  ],
  [UserRole.RECRUITER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_SURVEYS,
    Permission.MANAGE_SURVEYS,
    Permission.VIEW_ACTIONS,
  ],
  [UserRole.VIEWER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_TRENDS,
    Permission.VIEW_COHORTS,
    Permission.VIEW_GEOGRAPHIC,
    Permission.VIEW_ACTIONS,
    Permission.VIEW_SURVEYS,
  ],
};

