import { Request, Response } from 'express';
import { AdminService } from './admin.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { OrdersService } from '../orders/orders.service';
import { OrderStatus } from '@bookmarket/types';

export class AdminController {
  private adminService: AdminService;
  private ordersService: OrdersService;

  constructor() {
    this.adminService = new AdminService();
    this.ordersService = new OrdersService();
  }

  getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    const stats = await this.adminService.getDashboardStats();
    res.status(200).json(ApiResponse.success(stats));
  };

  getUsers = async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const role = req.query.role as string;

    const result = await this.adminService.getUsers(page, limit, search, role);
    res.status(200).json(ApiResponse.success(result.users, result.meta));
  };

  toggleBan = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await this.adminService.toggleUserBan(id);
    res.status(200).json(ApiResponse.success(user));
  };

  updateRoles = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { roles } = req.body;
    const user = await this.adminService.updateUserRoles(id, roles);
    res.status(200).json(ApiResponse.success(user));
  };

  getListings = async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const status = req.query.status as string;

    const result = await this.adminService.getListings(page, limit, search, status);
    res.status(200).json(ApiResponse.success(result.listings, result.meta));
  };

  moderateListing = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const moderatorId = req.user!.id;
    const book = await this.adminService.moderateListing(id, status, rejectionReason, moderatorId);
    res.status(200).json(ApiResponse.success(book));
  };

  getReports = async (req: Request, res: Response): Promise<void> => {
    const reports = await this.adminService.getPlatformReports();
    res.status(200).json(ApiResponse.success(reports));
  };

  getSupportTickets = async (req: Request, res: Response): Promise<void> => {
    const tickets = await this.adminService.getSupportTickets();
    res.status(200).json(ApiResponse.success(tickets));
  };

  resolveSupportTicket = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await this.adminService.resolveSupportTicket(id);
    res.status(200).json(ApiResponse.success(result));
  };

  /** Admin: list all orders with optional status filter */
  getAdminOrders = async (req: Request, res: Response): Promise<void> => {
    const statusFilter = req.query.status as string | undefined;
    const orders = await this.ordersService.getAdminOrders(statusFilter);
    res.status(200).json(ApiResponse.success(orders));
  };

  /** Admin: update any order's status */
  updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    const adminId = req.user!.id;
    const roles = req.user!.roles;
    const { id } = req.params;
    const { status, note } = req.body;
    const order = await this.ordersService.updateOrderStatus(
      id,
      adminId,
      roles,
      status as OrderStatus,
      note
    );
    res.status(200).json(ApiResponse.success(order));
  };

  /** Admin: approve or reject a buyer return request */
  resolveReturn = async (req: Request, res: Response): Promise<void> => {
    const adminId = req.user!.id;
    const { id } = req.params;
    const { action, adminNote } = req.body;
    const order = await this.ordersService.resolveReturn(id, adminId, action, adminNote);
    res.status(200).json(ApiResponse.success(order));
  };
}

export default AdminController;
