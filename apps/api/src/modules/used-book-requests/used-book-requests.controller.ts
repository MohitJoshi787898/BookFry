import { Request, Response, NextFunction } from 'express';
import { UsedBookRequestsService } from './used-book-requests.service';
import {
  CreateUsedBookRequestSchema,
  UpdateUsedBookRequestStatusSchema,
} from './used-book-requests.validation';

export class UsedBookRequestsController {
  private service: UsedBookRequestsService;

  constructor() {
    this.service = new UsedBookRequestsService();
  }

  createRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = CreateUsedBookRequestSchema.parse(req.body);
      const request = await this.service.createRequest(req.user!.id, validated);
      res.status(201).json({
        success: true,
        data: request,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  };

  getBuyerRequests = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requests = await this.service.getBuyerRequests(req.user!.id);
      res.status(200).json({
        success: true,
        data: requests,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  };

  getSellerRequests = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requests = await this.service.getSellerRequests(req.user!.id);
      res.status(200).json({
        success: true,
        data: requests,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  };

  getRequestById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const request = await this.service.getRequestById(
        req.params.id,
        req.user!.id,
        req.user!.roles
      );
      res.status(200).json({
        success: true,
        data: request,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = UpdateUsedBookRequestStatusSchema.parse(req.body);
      const updated = await this.service.updateStatus(
        req.params.id,
        req.user!.id,
        req.user!.roles,
        validated.status,
        validated.note
      );
      res.status(200).json({
        success: true,
        data: updated,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  };

  getAdminRequests = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const statusFilter = req.query.status as string | undefined;
      const requests = await this.service.getAdminRequests(statusFilter);
      res.status(200).json({
        success: true,
        data: requests,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  };
}
export default UsedBookRequestsController;
