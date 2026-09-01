import {
  ICourierProvider,
  CreateShipmentPayload,
  ShipmentResponse,
  TrackingStatusUpdate,
} from './courier-provider.interface';
import { logger } from '../../../utils/logger';

export class MockCourierProvider implements ICourierProvider {
  async createShipment(payload: CreateShipmentPayload): Promise<ShipmentResponse> {
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const awbCode = `AWB-BF-${randomSuffix}`;
    const courierName = 'BlueDart Express';
    const trackingUrl = `https://bookfry.in/track/${awbCode}`;

    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 3);

    logger.info(`[MockCourierProvider] Shipment created for subOrder ${payload.subOrderNumber}. AWB: ${awbCode}`);

    return {
      shipmentId: `SHIP_${randomSuffix}`,
      orderId: payload.orderId,
      awbCode,
      courierName,
      trackingUrl,
      estimatedDeliveryDate,
      status: 'AWB_ASSIGNED',
    };
  }

  async trackShipment(awbCode: string): Promise<TrackingStatusUpdate> {
    return {
      subOrderNumber: 'ORD-MOCK',
      awbCode,
      courierName: 'BlueDart Express',
      currentStatus: 'IN_TRANSIT',
      statusDetails: 'Package in transit to destination delivery hub',
      location: 'New Delhi Distribution Center',
      timestamp: new Date(),
    };
  }

  async cancelShipment(awbCode: string): Promise<{ success: boolean; message?: string }> {
    logger.info(`[MockCourierProvider] Shipment ${awbCode} cancelled`);
    return { success: true, message: `Shipment ${awbCode} successfully cancelled` };
  }

  verifyWebhookSignature(_rawBody: string, _signature: string): boolean {
    return true; // Always valid in mock / simulation mode
  }
}
