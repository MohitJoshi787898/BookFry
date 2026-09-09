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

  // CMS Handlers
  getCms = async (req: Request, res: Response): Promise<void> => {
    const cms = await this.adminService.getCms();
    res.status(200).json(ApiResponse.success(cms));
  };

  updateCms = async (req: Request, res: Response): Promise<void> => {
    const cms = await this.adminService.updateCms(req.body);
    res.status(200).json(ApiResponse.success(cms));
  };

  // Coupon Handlers
  getCoupons = async (req: Request, res: Response): Promise<void> => {
    const coupons = await this.adminService.getCoupons();
    res.status(200).json(ApiResponse.success(coupons));
  };

  createCoupon = async (req: Request, res: Response): Promise<void> => {
    const coupon = await this.adminService.createCoupon(req.body);
    res.status(201).json(ApiResponse.success(coupon));
  };

  deleteCoupon = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await this.adminService.deleteCoupon(id);
    res.status(200).json(ApiResponse.success({ deleted: true }));
  };

  // Settings Handlers
  getPlatformSettings = async (req: Request, res: Response): Promise<void> => {
    const settings = await this.adminService.getPlatformSettings();
    res.status(200).json(ApiResponse.success(settings));
  };

  updatePlatformSettings = async (req: Request, res: Response): Promise<void> => {
    const settings = await this.adminService.updatePlatformSettings(req.body);
    res.status(200).json(ApiResponse.success(settings));
  };

  // Reports CSV Export
  exportCsvReport = async (req: Request, res: Response): Promise<void> => {
    const csv = await this.adminService.exportCsvReport();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="bookfry-sales-report.csv"');
    res.status(200).send(csv);
  };

  getUserById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await this.adminService.getUserById(id);
    res.status(200).json(ApiResponse.success(user));
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await this.adminService.updateUser(id, req.body);
    res.status(200).json(ApiResponse.success(user));
  };

  softDeleteUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await this.adminService.softDeleteUser(id);
    res.status(200).json(ApiResponse.success(result));
  };

  getListingById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const listing = await this.adminService.getListingById(id);
    res.status(200).json(ApiResponse.success(listing));
  };

  updateListing = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const listing = await this.adminService.updateListing(id, req.body);
    res.status(200).json(ApiResponse.success(listing));
  };

  softDeleteListing = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await this.adminService.softDeleteListing(id);
    res.status(200).json(ApiResponse.success(result));
  };

  updateCoupon = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const coupon = await this.adminService.updateCoupon(id, req.body);
    res.status(200).json(ApiResponse.success(coupon));
  };

  updateSupportTicket = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const ticket = await this.adminService.updateSupportTicket(id, req.body);
    res.status(200).json(ApiResponse.success(ticket));
  };

  softDeleteSupportTicket = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await this.adminService.softDeleteSupportTicket(id);
    res.status(200).json(ApiResponse.success(result));
  };

  /**
   * PATCH /admin/users/:id/seller-verification
   * Admin approves or rejects a seller's verification request.
   * Body: { action: 'approved' | 'rejected', rejectionReason?: string }
   */
  updateSellerVerification = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { action, rejectionReason } = req.body;

    if (!action || !['approved', 'rejected'].includes(action)) {
      res.status(400).json(
        ApiResponse.error("action must be 'approved' or 'rejected'", 'VALIDATION_ERROR')
      );
      return;
    }

    const result = await this.adminService.updateSellerVerificationStatus(
      id,
      action as 'approved' | 'rejected',
      rejectionReason
    );
    res.status(200).json(ApiResponse.success(result));
  };
}

export default AdminController;

