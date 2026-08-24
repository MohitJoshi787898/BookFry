import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { emailQueue } from '../jobs/queues';

/**
 * Production Email Service Module for BookFry
 * Uses Nodemailer with Google App Password SMTP / SMTP credentials
 * Supports asynchronous BullMQ queuing with graceful degradation.
 */
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;

  constructor() {
    try {
      if (
        process.env.NODE_ENV !== 'test' &&
        env.SMTP_PASS &&
        env.SMTP_PASS !== 'dummy-google-app-password'
      ) {
        this.transporter = nodemailer.createTransport({
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          secure: env.SMTP_PORT === 465 || env.SMTP_SECURE,
          auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          },
        });
        this.isConfigured = true;
        logger.info('[EmailService] Nodemailer SMTP transporter initialized with configured credentials.');
      } else {
        logger.info('[EmailService] Running with placeholder SMTP credentials (simulation mode).');
      }
    } catch (err) {
      logger.warn('[EmailService] Failed to initialize Nodemailer transporter:', err);
    }
  }

  private async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    logger.info(`[Transactional Email Dispatch] To: ${to} | Subject: "${subject}"`);

    if (!this.isConfigured || !this.transporter) {
      logger.info(`[Email Simulation] Content dispatched in dev/simulation mode to ${to}.`);
      return true;
    }

    try {
      const info = await this.transporter.sendMail({
        from: env.SMTP_FROM,
        to,
        subject,
        html,
      });
      logger.info(`[Email Sent] Message ID: ${info.messageId} to ${to}`);
      return true;
    } catch (err) {
      logger.error(`[Email Dispatch Error] Failed sending email to ${to}:`, err);
      return false;
    }
  }

  // ==========================================
  // BullMQ Queuing Helpers
  // ==========================================
  async queueOrderConfirmation(to: string, buyerName: string, orderNumber: string, items: Array<{ title: string; price: number; quantity: number }>, totalAmount: number) {
    if (emailQueue) {
      await emailQueue.add('order_confirmation_buyer', { to, buyerName, orderNumber, items, totalAmount });
      return;
    }
    await this.sendOrderConfirmationToBuyer(to, buyerName, orderNumber, items, totalAmount);
  }

  async queueSaleNotification(to: string, sellerName: string, orderNumber: string, bookTitle: string, payoutAmount: number) {
    if (emailQueue) {
      await emailQueue.add('new_sale_seller', { to, sellerName, orderNumber, bookTitle, payoutAmount });
      return;
    }
    await this.sendSaleNotificationToSeller(to, sellerName, orderNumber, bookTitle, payoutAmount);
  }

  async queueUsedBookRequest(to: string, sellerName: string, requestNumber: string, bookTitle: string, buyerName: string, buyerEmail: string, buyerPhone?: string) {
    if (emailQueue) {
      await emailQueue.add('used_book_request_seller', { to, sellerName, requestNumber, bookTitle, buyerName, buyerEmail, buyerPhone });
      return;
    }
    await this.sendUsedBookRequestToSeller(to, sellerName, requestNumber, bookTitle, buyerName, buyerEmail, buyerPhone);
  }

  async queueUsedBookStatusUpdate(to: string, buyerName: string, requestNumber: string, bookTitle: string, status: string, note?: string) {
    if (emailQueue) {
      await emailQueue.add('used_book_status_buyer', { to, buyerName, requestNumber, bookTitle, status, note });
      return;
    }
    await this.sendUsedBookRequestStatusUpdateToBuyer(to, buyerName, requestNumber, bookTitle, status, note);
  }

  // ==========================================
  // Email Template Methods
  // ==========================================

  /** 1. Buyer Order Confirmation Email */
  async sendOrderConfirmationToBuyer(
    to: string,
    buyerName: string,
    orderNumber: string,
    items: Array<{ title: string; price: number; quantity: number }>,
    totalAmount: number
  ): Promise<boolean> {
    const itemsListHtml = items
      .map(
        (item) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 0; color: #1f2937; font-weight: 600;">${item.title} (x${item.quantity})</td>
        <td style="padding: 10px 0; text-align: right; color: #111827; font-weight: 700;">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
      )
      .join('');

    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/></head>
    <body style="font-family: Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
        <div style="background-color: #1A3B5C; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">BookFry • Order Confirmed</h1>
          <p style="color: #F26522; font-style: italic; margin-top: 6px; font-weight: bold;">"क्योंकि.. पढ़ाई रुकनी नहीं चाहिए"</p>
        </div>
        <div style="padding: 24px;">
          <p style="font-size: 16px; color: #374151;">Hi <strong>${buyerName}</strong>,</p>
          <p style="font-size: 14px; color: #4b5563;">Thank you for your order! We have received your payment and notified our verified seller partner to pack your book for express dispatch.</p>
          
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: bold;">Order Reference</p>
            <p style="margin: 4px 0 0 0; font-size: 18px; color: #1A3B5C; font-weight: bold; font-family: monospace;">${orderNumber}</p>
          </div>

          <h3 style="font-size: 16px; color: #111827; margin-bottom: 10px;">Order Breakdown</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            ${itemsListHtml}
            <tr>
              <td style="padding: 12px 0; font-weight: bold; color: #111827;">Total Paid:</td>
              <td style="padding: 12px 0; text-align: right; font-weight: bold; color: #F26522; font-size: 18px;">₹${totalAmount.toFixed(2)}</td>
            </tr>
          </table>

          <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <a href="https://bookfry.in/account/orders" style="display: inline-block; background-color: #F26522; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 14px;">Track Your Order</a>
          </div>
        </div>
      </div>
    </body>
    </html>`;

    return this.sendEmail(to, `Order Confirmed - ${orderNumber} | BookFry`, html);
  }

  /** 2. Seller New Sale Alert Email */
  async sendSaleNotificationToSeller(
    to: string,
    sellerName: string,
    orderNumber: string,
    bookTitle: string,
    payoutAmount: number
  ): Promise<boolean> {
    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/></head>
    <body style="font-family: Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
        <div style="background-color: #1A3B5C; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🎉 You Made a Sale on BookFry!</h1>
        </div>
        <div style="padding: 24px;">
          <p style="font-size: 16px; color: #374151;">Congratulations <strong>${sellerName}</strong>,</p>
          <p style="font-size: 14px; color: #4b5563;">A student just purchased your book listing! Please pack the book securely and dispatch with courier tracking.</p>
          
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 14px; color: #111827; font-weight: bold;">Book Title: ${bookTitle}</p>
            <p style="margin: 6px 0 0 0; font-size: 14px; color: #059669; font-weight: bold;">Your Net Escrow Payout: ₹${payoutAmount.toFixed(2)}</p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Order Ref: ${orderNumber}</p>
          </div>

          <div style="margin-top: 24px; text-align: center;">
            <a href="https://bookfry.in/seller/orders" style="display: inline-block; background-color: #1A3B5C; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 14px;">Dispatch Package & Manage Sale</a>
          </div>
        </div>
      </div>
    </body>
    </html>`;

    return this.sendEmail(to, `🎉 Action Required: New Order Received (${orderNumber}) | BookFry`, html);
  }

  /** 3. Seller Used Book Purchase Request Notification Email */
  async sendUsedBookRequestToSeller(
    to: string,
    sellerName: string,
    requestNumber: string,
    bookTitle: string,
    buyerName: string,
    buyerEmail: string,
    buyerPhone?: string
  ): Promise<boolean> {
    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/></head>
    <body style="font-family: Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
        <div style="background-color: #1A3B5C; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">📖 New Used Book Purchase Request!</h1>
          <p style="color: #F26522; font-style: italic; margin-top: 6px; font-weight: bold;">"BookFry Used Book Direct Contact"</p>
        </div>
        <div style="padding: 24px;">
          <p style="font-size: 16px; color: #374151;">Hi <strong>${sellerName}</strong>,</p>
          <p style="font-size: 14px; color: #4b5563;">A buyer is interested in purchasing your used book listing!</p>
          
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 14px; color: #111827; font-weight: bold;">Book Title: ${bookTitle}</p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Request Number: ${requestNumber}</p>
            <hr style="margin: 12px 0; border: none; border-top: 1px solid #e5e7eb;"/>
            <p style="margin: 0; font-size: 13px; color: #374151; font-weight: bold;">Buyer Details:</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #4b5563;">Name: ${buyerName}</p>
            <p style="margin: 2px 0 0 0; font-size: 13px; color: #4b5563;">Email: ${buyerEmail}</p>
            ${buyerPhone ? `<p style="margin: 2px 0 0 0; font-size: 13px; color: #4b5563;">Phone: ${buyerPhone}</p>` : ''}
          </div>

          <p style="font-size: 13px; color: #6b7280;">Please accept the request in your seller portal to coordinate handover and unlock buyer WhatsApp coordinates.</p>

          <div style="margin-top: 24px; text-align: center;">
            <a href="https://bookfry.in/seller/requests" style="display: inline-block; background-color: #F26522; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 14px;">View Request & Accept</a>
          </div>
        </div>
      </div>
    </body>
    </html>`;

    return this.sendEmail(to, `📖 Used Book Purchase Request Received (${requestNumber}) | BookFry`, html);
  }

  /** 4. Buyer Used Book Request Status Update Email */
  async sendUsedBookRequestStatusUpdateToBuyer(
    to: string,
    buyerName: string,
    requestNumber: string,
    bookTitle: string,
    status: string,
    note?: string
  ): Promise<boolean> {
    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/></head>
    <body style="font-family: Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
        <div style="background-color: #1A3B5C; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Update on your Used Book Request</h1>
        </div>
        <div style="padding: 24px;">
          <p style="font-size: 16px; color: #374151;">Hi <strong>${buyerName}</strong>,</p>
          <p style="font-size: 14px; color: #4b5563;">Your purchase request for <strong>${bookTitle}</strong> (Req #${requestNumber}) has been updated.</p>
          
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 14px; color: #111827; font-weight: bold;">New Status: <span style="color: #F26522; text-transform: uppercase;">${status.replace('_', ' ')}</span></p>
            ${note ? `<p style="margin: 6px 0 0 0; font-size: 13px; color: #4b5563;">Seller Note: ${note}</p>` : ''}
          </div>

          <div style="margin-top: 24px; text-align: center;">
            <a href="https://bookfry.in/account/requests" style="display: inline-block; background-color: #1A3B5C; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 14px;">View Request Details</a>
          </div>
        </div>
      </div>
    </body>
    </html>`;

    return this.sendEmail(to, `Update on Used Book Request ${requestNumber} | BookFry`, html);
  }

  /** 5. Password Reset OTP / Link Email */
  async sendPasswordResetEmail(to: string, name: string, resetLink: string): Promise<boolean> {
    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/></head>
    <body style="font-family: Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
        <div style="background-color: #1A3B5C; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Reset Your BookFry Password</h1>
        </div>
        <div style="padding: 24px;">
          <p style="font-size: 16px; color: #374151;">Hi <strong>${name}</strong>,</p>
          <p style="font-size: 14px; color: #4b5563;">We received a request to reset your password. Click the link below to set a new password. If you did not make this request, please ignore this email.</p>
          
          <div style="margin: 24px 0; text-align: center;">
            <a href="${resetLink}" style="display: inline-block; background-color: #F26522; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 14px;">Reset Password</a>
          </div>
          <p style="font-size: 12px; color: #9ca3af;">This link expires in 1 hour.</p>
        </div>
      </div>
    </body>
    </html>`;

    return this.sendEmail(to, `Reset your BookFry password`, html);
  }
}

export default EmailService;
