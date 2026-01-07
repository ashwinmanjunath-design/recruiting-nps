interface SurveySMSData {
  to: string;
  candidateName: string;
  surveyLink: string;
}

class SMSService {
  /**
   * Send survey SMS to candidate
   */
  async sendSurveySMS(data: SurveySMSData) {
    const smsMode = process.env.SMS_MODE || 'mock';

    if (smsMode === 'mock') {
      // Mock mode - just log the SMS
      console.log('[SMS Service] 📱 MOCK MODE - SMS not sent:', {
        to: data.to,
        candidateName: data.candidateName,
        message: this.generateSMSMessage(data),
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        mode: 'mock',
        messageId: `mock_${Date.now()}`,
        to: data.to,
      };
    }

    // Production mode - send via Twilio
    return await this.sendViaTwilio(data);
  }

  /**
   * Send SMS via Twilio (production)
   */
  private async sendViaTwilio(data: SurveySMSData) {
    console.log('[SMS Service] Sending SMS via Twilio:', {
      to: data.to,
      candidateName: data.candidateName,
    });

    try {
      // Uncomment when ready to use Twilio
      /*
      const twilio = require('twilio');
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      const message = await client.messages.create({
        body: this.generateSMSMessage(data),
        from: process.env.TWILIO_PHONE_NUMBER,
        to: data.to,
      });

      console.log('[SMS Service] ✅ SMS sent successfully:', {
        messageId: message.sid,
        status: message.status,
        to: data.to,
      });

      return {
        success: true,
        mode: 'production',
        messageId: message.sid,
        status: message.status,
        to: data.to,
      };
      */

      // For now, throw error if production mode is used without configuration
      throw new Error('Twilio is not configured. Set SMS_MODE=mock or configure Twilio credentials.');
    } catch (error: any) {
      console.error('[SMS Service] ❌ Failed to send SMS:', {
        error: error.message,
        to: data.to,
      });
      throw error;
    }
  }

  /**
   * Generate SMS message content
   */
  private generateSMSMessage(data: SurveySMSData): string {
    return `Hi ${data.candidateName}, we'd love your feedback on your recent interview. Please take our brief survey: ${data.surveyLink}`;
  }

  /**
   * Validate phone number format
   */
  isValidPhoneNumber(phone: string): boolean {
    // Basic validation - should be enhanced based on requirements
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * Format phone number for sending
   */
  formatPhoneNumber(phone: string): string {
    // Remove spaces, dashes, parentheses
    let formatted = phone.replace(/[\s\-\(\)]/g, '');
    
    // Add + if missing
    if (!formatted.startsWith('+')) {
      formatted = '+' + formatted;
    }
    
    return formatted;
  }
}

export default new SMSService();

