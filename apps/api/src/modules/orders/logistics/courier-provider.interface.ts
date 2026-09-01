export interface ShipmentItem {
  name: string;
  sku?: string;
  units: number;
  sellingPrice: number;
  discount?: number;
  tax?: number;
}

export interface CreateShipmentPayload {
  orderId: string;
  subOrderNumber: string;
  orderDate: Date;
  pickupLocation: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  deliveryAddress: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  items: ShipmentItem[];
  paymentMethod: 'Prepaid' | 'COD';
  subTotal: number;
  length?: number;
  breadth?: number;
  height?: number;
  weight?: number; // In kg
}

export interface ShipmentResponse {
  shipmentId: string;
  orderId: string;
  awbCode: string;
  courierName: string;
  courierCompanyId?: number;
  trackingUrl: string;
  labelUrl?: string;
  manifestUrl?: string;
  estimatedDeliveryDate?: Date;
  status: 'AWB_ASSIGNED' | 'PICKUP_SCHEDULED' | 'SHIPPED';
}

export interface TrackingStatusUpdate {
  subOrderNumber: string;
  awbCode: string;
  courierName: string;
  currentStatus: 'AWB_ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'RTO_INITIATED' | 'CANCELLED';
  statusDetails?: string;
  location?: string;
  timestamp: Date;
  deliveredAt?: Date;
}

export interface ICourierProvider {
  createShipment(payload: CreateShipmentPayload): Promise<ShipmentResponse>;
  trackShipment(awbCode: string): Promise<TrackingStatusUpdate>;
  cancelShipment(awbCode: string): Promise<{ success: boolean; message?: string }>;
  verifyWebhookSignature(rawBody: string, signature: string): boolean;
}
