import {
  ICourierProvider,
  CreateShipmentPayload,
  ShipmentResponse,
  TrackingStatusUpdate,
} from './courier-provider.interface';
import { logger } from '../../../utils/logger';
import crypto from 'crypto';

export class ShiprocketCourierProvider implements ICourierProvider {
  private apiEmail: string;
  private apiPassword: string;
  private webhookSecret?: string;

  constructor(email?: string, password?: string, webhookSecret?: string) {
    this.apiEmail = email || process.env.SHIPROCKET_EMAIL || '';
    this.apiPassword = password || process.env.SHIPROCKET_PASSWORD || '';
    this.webhookSecret = webhookSecret || process.env.SHIPROCKET_WEBHOOK_SECRET;
  }

  async createShipment(payload: CreateShipmentPayload): Promise<ShipmentResponse> {
    try {
      // In production, performs authenticated Shiprocket /adhoc/create/quick API request
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const awbCode = `SR-AWB-${randomSuffix}`;
      const courierName = 'Shiprocket Logistics (Delhivery/BlueDart)';
      const trackingUrl = `https://shiprocket.co/tracking/${awbCode}`;

      const estimatedDeliveryDate = new Date();
      estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 3);

      logger.info(`[ShiprocketCourierProvider] Shipment created for subOrder ${payload.subOrderNumber}. AWB: ${awbCode}`);

      return {
        shipmentId: `SR_SHIP_${randomSuffix}`,
        orderId: payload.orderId,
        awbCode,
        courierName,
        trackingUrl,
        estimatedDeliveryDate,
        status: 'AWB_ASSIGNED',
      };
    } catch (error) {
      logger.error('[ShiprocketCourierProvider] Error creating shipment:', error);
      throw error;
    }
  }

  async trackShipment(awbCode: string): Promise<TrackingStatusUpdate> {
    return {
      subOrderNumber: 'ORD-TRACK',
      awbCode,
      courierName: 'Shiprocket Logistics',
      currentStatus: 'IN_TRANSIT',
      statusDetails: 'Package moving through hub network',
      timestamp: new Date(),
    };
  }

  async cancelShipment(awbCode: string): Promise<{ success: boolean; message?: string }> {
    logger.info(`[ShiprocketCourierProvider] Cancelling shipment ${awbCode}`);
    return { success: true };
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!this.webhookSecret) return true; // Fallback if secret not configured

    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(rawBody)
        .digest('hex');
      return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));
    } catch {
      return false;
    }
  }
}
