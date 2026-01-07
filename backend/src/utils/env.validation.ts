/**
 * Environment variable validation
 * Fails fast if required secrets are missing
 */

const REQUIRED_ENV_VARS = [
  'JWT_SECRET',
  'DATABASE_URL',
] as const;

const REQUIRED_ENV_VARS_PROD = [
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
] as const;

/**
 * Validate environment variables on startup
 */
export function validateEnvironment(): void {
  const missing: string[] = [];

  // Check required vars
  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName] || process.env[varName] === '') {
      missing.push(varName);
    }
  }

  // Check production-specific vars
  if (process.env.NODE_ENV === 'production') {
    for (const varName of REQUIRED_ENV_VARS_PROD) {
      if (!process.env[varName] || process.env[varName] === '') {
        missing.push(varName);
      }
    }
  }

  // Check for default/weak secrets
  if (process.env.JWT_SECRET === 'secret' || process.env.JWT_SECRET === 'your-secret-key') {
    throw new Error('JWT_SECRET must be set to a strong, random value (not default)');
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please set these in your .env file or environment.'
    );
  }

  // Warn about insecure defaults
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[ENV] Running in development mode - some security checks are relaxed');
  }
}

