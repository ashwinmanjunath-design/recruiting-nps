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
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = this.createTransporter();
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
      });
    } else {
      // Production: Resend SMTP (fallback)
      console.log('[Email Service] Using Resend for production emails');
      return nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
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
    const fromEmailValidation = validateEmail(data.fromEmail || '');
    if (!fromEmailValidation.valid && data.fromEmail) {
      throw new Error(`Invalid fromEmail: ${fromEmailValidation.error}`);
    }

    // For Gmail SMTP, the fromEmail should match SMTP_USER to avoid authentication issues
    const smtpUser = process.env.SMTP_USER;
    let fromEmail = data.fromEmail ? sanitizeEmailHeader(data.fromEmail.toLowerCase().trim()) : null;
    
    if (smtpUser && fromEmail && fromEmail !== smtpUser.toLowerCase().trim()) {
      secureLogger.warn('fromEmail mismatch with SMTP_USER, using SMTP_USER', {
        requestedFrom: fromEmail,
        smtpUser,
      });
      fromEmail = sanitizeEmailHeader(smtpUser.toLowerCase().trim());
    } else if (!fromEmail && smtpUser) {
      fromEmail = sanitizeEmailHeader(smtpUser.toLowerCase().trim());
    } else if (!fromEmail) {
      throw new Error('fromEmail is required and must be from an allowed domain');
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
      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('[Email Service] ✅ Email sent successfully:', {
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

