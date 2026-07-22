import { Request, Response } from 'express';
import { AdminService } from './admin.service';
import { ApiResponse } from '../../utils/ApiResponse';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
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
    const { status } = req.body;
    const book = await this.adminService.moderateListing(id, status);
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
}

export default AdminController;
