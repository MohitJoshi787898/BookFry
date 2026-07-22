export interface CreateIntentResult {
  clientSecret: string;
  id: string;
  keyId?: string;
  amount?: number;
  currency?: string;
}

export interface VerifyWebhookResult {
  orderId: string;
  status: 'paid' | 'failed';
  paymentRef: string;
}

export interface PaymentProvider {
  createPaymentIntent(
    amount: number,
    currency: string,
    orderId: string
  ): Promise<CreateIntentResult>;
  verifyWebhook(payload: any, signature: string): Promise<VerifyWebhookResult>;
}
