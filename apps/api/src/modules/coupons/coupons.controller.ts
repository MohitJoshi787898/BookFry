import { Request, Response } from 'express';
import { CouponsService } from './coupons.service';
import { ApiResponse } from '../../utils/ApiResponse';

export class CouponsController {
  private couponsService: CouponsService;

  constructor() {
    this.couponsService = new CouponsService();
  }

  getActiveCoupons = async (req: Request, res: Response): Promise<void> => {
    const coupons = await this.couponsService.getActiveCoupons();
    res.status(200).json(ApiResponse.success(coupons));
  };

  validateCoupon = async (req: Request, res: Response): Promise<void> => {
    const { code, subtotal } = req.body;
    const numericSubtotal = Number(subtotal) || 0;
    const result = await this.couponsService.validateCoupon(code, numericSubtotal);
    res.status(200).json(ApiResponse.success(result));
  };
}
