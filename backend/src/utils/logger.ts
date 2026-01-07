/**
 * Secure logging utility that masks sensitive data
 */

const SENSITIVE_FIELDS = [
  'password',
  'pass',
  'token',
  'secret',
  'key',
  'authorization',
  'smtp_pass',
  'smtp_user',
  'jwt_secret',
  'refreshToken',
  'accessToken',
];

/**
 * Mask sensitive values in objects
 */
function maskSensitiveData(obj: any, depth = 0): any {
  if (depth > 10) return '[MAX_DEPTH]'; // Prevent infinite recursion

  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    // If it looks like a token or secret, mask it
    if (obj.length > 20 && /^[A-Za-z0-9_-]+$/.test(obj)) {
      return `${obj.substring(0, 4)}***${obj.substring(obj.length - 4)}`;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => maskSensitiveData(item, depth + 1));
  }

  if (typeof obj === 'object') {
    const masked: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = SENSITIVE_FIELDS.some(field => lowerKey.includes(field));

      if (isSensitive && typeof value === 'string') {
        masked[key] = '***MASKED***';
      } else {
        masked[key] = maskSensitiveData(value, depth + 1);
      }
    }
    return masked;
  }

  return obj;
}

/**
 * Secure logger that masks sensitive data
 */
export const secureLogger = {
  info: (message: string, data?: any) => {
    const masked = data ? maskSensitiveData(data) : undefined;
    console.log(`[INFO] ${message}`, masked || '');
  },

  error: (message: string, error?: any) => {
    const masked = error ? maskSensitiveData(error) : undefined;
    console.error(`[ERROR] ${message}`, masked || '');
  },

  warn: (message: string, data?: any) => {
    const masked = data ? maskSensitiveData(data) : undefined;
    console.warn(`[WARN] ${message}`, masked || '');
  },

  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      const masked = data ? maskSensitiveData(data) : undefined;
      console.debug(`[DEBUG] ${message}`, masked || '');
    }
  },
};

