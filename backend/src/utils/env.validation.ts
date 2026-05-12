/**
 * Environment variable validation
 * Fails fast if required secrets are missing
 */

const REQUIRED_ENV_VARS = [
  'JWT_SECRET',
  'DATABASE_URL',
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
    const provider = (process.env.EMAIL_PROVIDER || 'smtp').toLowerCase();

    if (provider === 'sendgrid') {
      if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY === '') {
        missing.push('SENDGRID_API_KEY');
      }
    } else if (provider === 'resend') {
      if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === '') {
        missing.push('RESEND_API_KEY');
      }
    } else {
      for (const varName of ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'] as const) {
        if (!process.env[varName] || process.env[varName] === '') {
          missing.push(varName);
        }
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
