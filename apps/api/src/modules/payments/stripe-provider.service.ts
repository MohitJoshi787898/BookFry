import Stripe from 'stripe';
import {
  PaymentProvider,
  CreateIntentResult,
  VerifyWebhookResult,
} from './payment-provider.interface';
import { logger } from '../../utils/logger';

export class StripeProvider implements PaymentProvider {
  private stripe: Stripe;

  constructor() {
    const secret = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
    this.stripe = new Stripe(secret, {
      apiVersion: '2025-01-27.acacia' as any,
    });
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    orderId: string
  ): Promise<CreateIntentResult> {
    logger.info(
      `[StripeProvider] Creating payment intent for amount $${amount} ${currency} for order ${orderId}`
    );

    const amountInCents = Math.round(amount * 100);

    const intent = await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata: { orderId },
      payment_method_types: ['card'],
    });

    if (!intent.client_secret) {
      throw new Error('Stripe failed to return client secret');
    }

    return {
      clientSecret: intent.client_secret,
      id: intent.id,
    };
  }

  async verifyWebhook(payload: any, signature: string): Promise<VerifyWebhookResult> {
    logger.info('[StripeProvider] Verifying Stripe webhook signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      logger.error('❌ Stripe webhook signature verification failed:', err.message);
      throw new Error(`Webhook Signature verification failed: ${err.message}`);
    }

    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderId = paymentIntent.metadata?.orderId;

    if (!orderId) {
      throw new Error('Order ID missing in payment intent metadata');
    }

    let status: 'paid' | 'failed' = 'failed';
    if (event.type === 'payment_intent.succeeded') {
      status = 'paid';
    }

    return {
      orderId,
      status,
      paymentRef: paymentIntent.id,
    };
  }
}
export default StripeProvider;
