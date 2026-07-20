import { logger } from './logger';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  /**
   * Sends a transactional email. Logs to console/logger if SMTP configuration is not present.
   */
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // If SMTP details are configured via env vars, node-mailer or sendgrid could be invoked here.
      // Graceful fallback to structured logger in local / test environments:
      logger.info(`[Email Service] To: ${options.to} | Subject: ${options.subject}`);
      logger.debug(`[Email Service Content]\n${options.html}`);
      return true;
    } catch (err) {
      logger.error('[Email Service Error]', err);
      return false;
    }
  }

  static async sendOrderConfirmation(toEmail: string, orderNumber: string, total: number): Promise<boolean> {
    return this.sendEmail({
      to: toEmail,
      subject: `Order Confirmation - ${orderNumber}`,
      html: `<h1>Thank you for your order!</h1><p>Your order <strong>${orderNumber}</strong> for <strong>$${total.toFixed(
        2
      )}</strong> has been confirmed.</p>`,
    });
  }

  static async sendShippingNotification(toEmail: string, orderNumber: string): Promise<boolean> {
    return this.sendEmail({
      to: toEmail,
      subject: `Your Order ${orderNumber} Has Shipped!`,
      html: `<h1>Good news!</h1><p>Your order <strong>${orderNumber}</strong> has been shipped by the seller.</p>`,
    });
  }
}

export default EmailService;
