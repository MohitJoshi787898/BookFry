import Razorpay from 'razorpay';
import crypto from 'crypto';
import {
  PaymentProvider,
  CreateIntentResult,
  VerifyWebhookResult,
} from './payment-provider.interface';
import { logger } from '../../utils/logger';

export class RazorpayProvider implements PaymentProvider {
  private razorpay: Razorpay;
  private keyId: string;
  private keySecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    this.razorpay = new Razorpay({
      key_id: this.keyId,
      key_secret: this.keySecret,
    });
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    orderId: string
  ): Promise<CreateIntentResult> {
    const targetCurrency = 'INR';
    
    // Normalize amount to Rupees if inadvertently passed in subunits (> 100000 paise threshold for textbook orders)
    const amountInRupees = amount > 100000 ? amount / 100 : amount;
    const amountInSubunits = Math.round(amountInRupees * 100);

    logger.info(
      `[RazorpayProvider] Creating Razorpay order: ₹${amountInRupees.toFixed(2)} (${amountInSubunits} paise) ${targetCurrency} for order ${orderId}`
    );

    try {
      const order = await this.razorpay.orders.create({
        amount: amountInSubunits,
        currency: targetCurrency,
        receipt: orderId,
        notes: { orderId },
      });

      return {
        clientSecret: order.id, // For Razorpay clientSecret is order.id
        id: order.id,
        keyId: this.keyId,
        amount: amountInSubunits,
        currency: targetCurrency,
      };
    } catch (err: any) {
      logger.error('❌ Razorpay order creation failed:', err);
      throw new Error(`Razorpay order creation failed: ${err.message}`);
    }
  }

  async verifyWebhook(payload: any, signature: string): Promise<VerifyWebhookResult> {
    logger.info('[RazorpayProvider] Verifying Razorpay webhook signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    // If webhookSecret is configured, verify HMAC signature
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
        .digest('hex');

      if (expectedSignature !== signature) {
        logger.error('❌ Razorpay webhook signature mismatch');
        throw new Error('Webhook signature mismatch');
      }
    }

    const event = typeof payload === 'string' ? JSON.parse(payload) : payload;
    
    // Support standard razorpay webhook event formats (e.g. order.paid or payment.authorized)
    const orderEntity = event.payload?.order?.entity;
    const paymentEntity = event.payload?.payment?.entity;
    
    const orderId = orderEntity?.receipt || paymentEntity?.notes?.orderId || event.orderId || event.payload?.orderId;
    const paymentRef = paymentEntity?.id || event.paymentIntentId || 'pay_razorpay_mock';

    if (!orderId) {
      throw new Error('Order ID missing in webhook payload');
    }

    let status: 'paid' | 'failed' = 'failed';
    if (event.event === 'order.paid' || event.event === 'payment.captured' || event.orderId || event.paymentIntentId) {
      status = 'paid';
    }

    return {
      orderId,
      status,
      paymentRef,
    };
  }

  // Method to verify checkout response signatures (client-side verification)
  verifyPaymentSignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): boolean {
    const text = `${razorpayOrderId}|${razorpayPaymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(text)
      .digest('hex');

    return generatedSignature === razorpaySignature;
  }
}

export default RazorpayProvider;
