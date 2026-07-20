import {
  PaymentProvider,
  CreateIntentResult,
  VerifyWebhookResult,
} from './payment-provider.interface';
import { logger } from '../../utils/logger';

export class MockPaymentProvider implements PaymentProvider {
  async createPaymentIntent(
    amount: number,
    currency: string,
    orderId: string
  ): Promise<CreateIntentResult> {
    const mockId = `pi_mock_${Math.random().toString(36).substring(2, 10)}`;
    const clientSecret = `${mockId}_secret_${Math.random().toString(36).substring(2, 10)}`;

    logger.info(
      `[MockPaymentProvider] Created mock payment intent ${mockId} for amount $${amount} ${currency} for order ${orderId}`
    );

    return {
      clientSecret,
      id: mockId,
    };
  }

  async verifyWebhook(payload: any, signature: string): Promise<VerifyWebhookResult> {
    logger.info('[MockPaymentProvider] Verifying mock webhook payload');
    const parsedPayload = Buffer.isBuffer(payload)
      ? JSON.parse(payload.toString())
      : typeof payload === 'string'
        ? JSON.parse(payload)
        : payload;

    const orderId = parsedPayload.orderId || parsedPayload.data?.object?.metadata?.orderId;
    const paymentRef = parsedPayload.paymentIntentId || parsedPayload.data?.object?.id || 'pi_mock_ref';

    return {
      orderId,
      status: 'paid',
      paymentRef,
    };
  }
}
export default MockPaymentProvider;
