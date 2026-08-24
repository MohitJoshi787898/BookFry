import { Request, Response } from 'express';
import { OrdersService } from './orders.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { OrderStatus } from '@bookmarket/types';

export class OrdersController {
  private ordersService: OrdersService;

  constructor() {
    this.ordersService = new OrdersService();
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const buyerId = req.user!.id;
    const { shippingAddress, couponCode } = req.body;
    const order = await this.ordersService.createOrder(buyerId, shippingAddress, couponCode);
    res.status(201).json(ApiResponse.success(order));
  };

  createMixedCheckout = async (req: Request, res: Response): Promise<void> => {
    const buyerId = req.user!.id;
    const { shippingAddress, couponCode, buyerContact } = req.body;
    const result = await this.ordersService.createMixedCheckout(
      buyerId,
      shippingAddress,
      couponCode,
      buyerContact
    );
    res.status(201).json(ApiResponse.success(result));
  };

  getDetails = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const roles = req.user!.roles;
    const { id } = req.params;
    const order = await this.ordersService.getOrderById(id, userId, roles);
    res.status(200).json(ApiResponse.success(order));
  };

  getPublicInvoiceDetails = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const roles = req.user!.roles;
    const { id } = req.params;
    const order = await this.ordersService.getPublicInvoice(id, userId, roles);
    res.status(200).json(ApiResponse.success(order));
  };

  listBuyerOrders = async (req: Request, res: Response): Promise<void> => {
    const buyerId = req.user!.id;
    const orders = await this.ordersService.getBuyerOrders(buyerId);
    res.status(200).json(ApiResponse.success(orders));
  };

  listSellerOrders = async (req: Request, res: Response): Promise<void> => {
    const sellerId = req.user!.id;
    const orders = await this.ordersService.getSellerOrders(sellerId);
    res.status(200).json(ApiResponse.success(orders));
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const roles = req.user!.roles;
    const { id } = req.params;
    const { status, note } = req.body;
    const order = await this.ordersService.updateOrderStatus(
      id,
      userId,
      roles,
      status as OrderStatus,
      note
    );
    res.status(200).json(ApiResponse.success(order));
  };

  updateSubOrderStatus = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const roles = req.user!.roles;
    const { orderId, subOrderId } = req.params;
    const { status, note, carrier, trackingNumber, trackingUrl, estimatedDays } = req.body;
    const order = await this.ordersService.updateSubOrderStatus(
      orderId,
      subOrderId,
      userId,
      roles,
      status as OrderStatus,
      { carrier, trackingNumber, trackingUrl, estimatedDays },
      note
    );
    res.status(200).json(ApiResponse.success(order));
  };

  requestReturn = async (req: Request, res: Response): Promise<void> => {
    const buyerId = req.user!.id;
    const { id } = req.params;
    const { reason } = req.body;
    const order = await this.ordersService.requestReturn(id, buyerId, reason);
    res.status(200).json(ApiResponse.success(order));
  };

  resolveReturn = async (req: Request, res: Response): Promise<void> => {
    const adminId = req.user!.id;
    const { id } = req.params;
    const { action, adminNote } = req.body;
    const order = await this.ordersService.resolveReturn(id, adminId, action, adminNote);
    res.status(200).json(ApiResponse.success(order));
  };

  adminListAll = async (req: Request, res: Response): Promise<void> => {
    const statusFilter = req.query.status as string | undefined;
    const orders = await this.ordersService.getAdminOrders(statusFilter);
    res.status(200).json(ApiResponse.success(orders));
  };
}
export default OrdersController;
