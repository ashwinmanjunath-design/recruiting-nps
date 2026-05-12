import nodemailer from 'nodemailer';
import { validateEmail, sanitizeEmailHeader } from '../utils/validation';
import { secureLogger } from '../utils/logger';

interface SurveyEmailData {
  to: string;
  candidateName: string;
  surveyLink: string;
  templateName: string;
  subject?: string; // Optional custom subject
  fromEmail?: string; // Optional custom from email
}

class EmailService {
  private transporter: nodemailer.Transporter | null;
  private emailProvider: 'smtp' | 'sendgrid';

  constructor() {
    const provider = (process.env.EMAIL_PROVIDER || 'smtp').toLowerCase();
    this.emailProvider = provider === 'sendgrid' ? 'sendgrid' : 'smtp';
    this.transporter = this.emailProvider === 'smtp' ? this.createTransporter() : null;

    if (this.emailProvider === 'smtp') {
      void this.verifyTransporterConnection();
    } else {
      console.log('[Email Service] Using SendGrid API provider for email delivery');
    }
  }

  /**
   * Create email transporter based on environment
   */
  private createTransporter(): nodemailer.Transporter {
    // Check if SMTP credentials are provided (for real email sending)
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      // Use real SMTP configuration
      console.log('[Email Service] Using SMTP configuration for real email sending');
      console.log(`[Email Service] SMTP Host: ${smtpHost}:${process.env.SMTP_PORT || 587}`);
      return nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_PORT === '465', // true for port 465, false otherwise
        connectionTimeout: 15000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    }

    // Fallback to MailHog for local development if SMTP not configured
    const emailMode = process.env.EMAIL_MODE || 'local';
    if (emailMode === 'local') {
      console.log('[Email Service] Using MailHog for local email testing (SMTP not configured)');
      return nodemailer.createTransport({
        host: process.env.MAILHOG_HOST || 'localhost',
        port: parseInt(process.env.MAILHOG_PORT || '1025', 10),
        secure: false,
        ignoreTLS: true,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });
    } else {
      // Production: Resend SMTP (fallback)
      console.log('[Email Service] Using Resend for production emails');
      return nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        connectionTimeout: 15000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
        auth: {
          user: 'resend',
          pass: process.env.RESEND_API_KEY,
        },
      });
    }
  }

  /**
   * Send survey email to candidate
   * Includes security validation for email addresses and headers
   */
  async sendSurveyEmail(data: SurveyEmailData) {

    // Validate recipient email
    const recipientValidation = validateEmail(data.to);
    if (!recipientValidation.valid) {
      throw new Error(`Invalid recipient email: ${recipientValidation.error}`);
    }

    const recipient = data.to.toLowerCase().trim();

    const emailHtml = this.generateSurveyEmailHTML(data);
    const emailText = this.generateSurveyEmailText(data);

    // Validate and sanitize fromEmail
    const defaultFromEmail = process.env.DEFAULT_FROM_EMAIL?.toLowerCase().trim() || '';
    const requestedFrom = data.fromEmail?.toLowerCase().trim() || defaultFromEmail;
    const fromEmailValidation = validateEmail(requestedFrom || '');
    if (!fromEmailValidation.valid) {
      throw new Error(`Invalid fromEmail: ${fromEmailValidation.error}`);
    }

    // For Gmail SMTP, the fromEmail should match SMTP_USER to avoid authentication issues
    const smtpUser = process.env.SMTP_USER;
    let fromEmail = sanitizeEmailHeader(requestedFrom);

    if (this.emailProvider === 'smtp' && smtpUser && fromEmail !== smtpUser.toLowerCase().trim()) {
      secureLogger.warn('fromEmail mismatch with SMTP_USER, using SMTP_USER', {
        requestedFrom: fromEmail,
        smtpUser,
      });
      fromEmail = sanitizeEmailHeader(smtpUser.toLowerCase().trim());
    }

    // Sanitize subject to prevent header injection
    const subject = sanitizeEmailHeader(data.subject || `Feedback Request: ${data.templateName}`);

    const mailOptions = {
      from: fromEmail,
      to: recipient,
      subject,
      html: emailHtml,
      text: emailText,
    };

    // Log email details for debugging
    console.log('[Email Service] ⚠️  EMAIL DETAILS - FROM:', mailOptions.from, 'TO:', mailOptions.to);
    console.log('[Email Service] Sending survey email:', {
      provider: this.emailProvider,
      environment: process.env.NODE_ENV || 'development',
      from: mailOptions.from,
      to: recipient,
      subject: mailOptions.subject,
      candidateName: data.candidateName,
      surveyLink: data.surveyLink,
      timestamp: new Date().toISOString(),
    });
    console.log('[Email Service] Email fromEmail input:', data.fromEmail);
    console.log('[Email Service] SMTP_USER:', smtpUser);
    console.log('[Email Service] Final from field:', fromEmail);

    try {
      const result = this.emailProvider === 'sendgrid'
        ? await this.sendViaSendGrid(mailOptions)
        : await Promise.race([
            this.transporter!.sendMail(mailOptions),
            new Promise<never>((_, reject) => {
              setTimeout(() => reject(new Error('Email send timeout after 25s')), 25000);
            }),
          ]);
      
      console.log('[Email Service] ✅ Email sent successfully:', {
        provider: this.emailProvider,
        messageId: result.messageId,
        response: result.response,
        accepted: result.accepted,
      });

      const isDev = process.env.NODE_ENV !== 'production';
      if (isDev) {
        const emailMode = process.env.EMAIL_MODE || 'local';
        if (emailMode === 'local') {
          console.log('[Email Service] 📬 View email at: http://localhost:8025');
        }
      }

      return {
        success: true,
        messageId: result.messageId,
        recipient: recipient,
      };
    } catch (error: any) {
      console.error('[Email Service] ❌ Failed to send email:', {
        error: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Verify transporter on startup to surface connectivity issues early.
   */
  private async verifyTransporterConnection(): Promise<void> {
    if (!this.transporter) {
      return;
    }

    try {
      await this.transporter.verify();
      console.log('[Email Service] Transport verification successful');
    } catch (error: any) {
      console.error('[Email Service] Transport verification failed:', {
        error: error?.message,
        code: error?.code,
        command: error?.command,
      });
    }
  }

  private async sendViaSendGrid(mailOptions: {
    from: string;
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<{ messageId: string; response: string; accepted: string[] }> {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY is not configured');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: mailOptions.to }] }],
          from: { email: mailOptions.from },
          subject: mailOptions.subject,
          content: [
            { type: 'text/plain', value: mailOptions.text },
            { type: 'text/html', value: mailOptions.html },
          ],
        }),
        signal: controller.signal,
      });

      const bodyText = await response.text();

      if (!response.ok) {
        throw new Error(`SendGrid API error (${response.status}): ${bodyText || response.statusText}`);
      }

      return {
        messageId: response.headers.get('x-message-id') || `sendgrid-${Date.now()}`,
        response: '202 Accepted',
        accepted: [mailOptions.to],
      };
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        throw new Error('SendGrid API timeout after 20s');
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Generate HTML version of survey email
   */
  private generateSurveyEmailHTML(data: SurveyEmailData): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.templateName}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 40px 30px;
          }
          .content h2 {
            color: #1f2937;
            font-size: 22px;
            margin-top: 0;
            margin-bottom: 20px;
          }
          .content p {
            color: #4b5563;
            margin-bottom: 20px;
          }
          .button-container {
            text-align: center;
            margin: 40px 0;
          }
          .button {
            display: inline-block;
            background: #4F46E5;
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: background 0.3s;
          }
          .button:hover {
            background: #4338CA;
          }
          .link-alternative {
            margin-top: 30px;
            padding: 20px;
            background-color: #f9fafb;
            border-radius: 8px;
            border-left: 4px solid #4F46E5;
          }
          .link-alternative p {
            margin: 0;
            font-size: 14px;
            color: #6b7280;
          }
          .link-alternative a {
            color: #4F46E5;
            word-break: break-all;
          }
          .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .footer p {
            margin: 5px 0;
            font-size: 14px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 We'd love your feedback!</h1>
          </div>
          
          <div class="content">
            <h2>Hi ${data.candidateName},</h2>
            
            <p>
              Thank you for taking the time to interview with us. Your experience matters to us, 
              and we'd greatly appreciate your honest feedback about the interview process.
            </p>
            
            <p>
              This brief survey will take less than 5 minutes to complete, and your responses 
              will help us improve our recruitment process for future candidates.
            </p>
            
            <div class="button-container">
              <a href="${data.surveyLink}" class="button">Take Survey</a>
            </div>
            
            <div class="link-alternative">
              <p><strong>Having trouble with the button?</strong> Copy and paste this link into your browser:</p>
              <p><a href="${data.surveyLink}">${data.surveyLink}</a></p>
            </div>
            
            <p style="margin-top: 30px;">
              Thank you for your time and consideration!
            </p>
            
            <p style="margin-top: 30px; color: #9ca3af; font-size: 14px;">
              <em>This survey will remain active for 14 days.</em>
            </p>
          </div>
          
          <div class="footer">
            <p><strong>Candidate 360° NPS</strong></p>
            <p>© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate plain text version of survey email
   */
  private generateSurveyEmailText(data: SurveyEmailData): string {
    return `
We'd love your feedback!

Hi ${data.candidateName},

Thank you for taking the time to interview with us. Your experience matters to us, and we'd greatly appreciate your honest feedback about the interview process.

This brief survey will take less than 5 minutes to complete, and your responses will help us improve our recruitment process for future candidates.

Take Survey:
${data.surveyLink}

Thank you for your time and consideration!

---
Candidate 360° NPS
© ${new Date().getFullYear()} Your Company. All rights reserved.
    `.trim();
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('[Email Service] ✅ Email server connection verified');
      return true;
    } catch (error: any) {
      console.error('[Email Service] ❌ Email server connection failed:', error.message);
      return false;
    }
  }
}

export default new EmailService();
