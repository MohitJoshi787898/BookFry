import { PaymentProvider } from './payment-provider.interface';
import { StripeProvider } from './stripe-provider.service';
import { RazorpayProvider } from './razorpay-provider.service';
import { MockPaymentProvider } from './mock-provider.service';
import { logger } from '../../utils/logger';

let provider: PaymentProvider | null = null;

export const getPaymentProvider = (): PaymentProvider => {
  if (!provider) {
    if (
      process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_ID !== 'rzp_test_placeholder'
    ) {
      logger.info('💳 Using Live Razorpay Payment Provider');
      provider = new RazorpayProvider();
    } else if (
      process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder'
    ) {
      logger.info('💳 Using Live Stripe Payment Provider');
      provider = new StripeProvider();
    } else {
      logger.info('⚙️ Using Simulated Mock Payment Provider (No active payment keys configured)');
      provider = new MockPaymentProvider();
    }
  }
  return provider;
};
