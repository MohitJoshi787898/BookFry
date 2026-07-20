import { Request, Response } from 'express';
import { SellerService } from './seller.service';
import { ApiResponse } from '../../utils/ApiResponse';

export class SellerController {
  private sellerService: SellerService;

  constructor() {
    this.sellerService = new SellerService();
  }

  getDashboard = async (req: Request, res: Response): Promise<void> => {
    const sellerId = req.user!.id;
    const stats = await this.sellerService.getDashboardStats(sellerId);
    res.status(200).json(ApiResponse.success(stats));
  };

  getEarnings = async (req: Request, res: Response): Promise<void> => {
    const sellerId = req.user!.id;
    const ledger = await this.sellerService.getEarningsLedger(sellerId);
    res.status(200).json(ApiResponse.success(ledger));
  };
}
export default SellerController;
