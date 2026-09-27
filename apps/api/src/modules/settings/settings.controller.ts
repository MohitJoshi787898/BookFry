import { Request, Response } from 'express';
import { SellerAccessPolicy } from '../admin/seller-access.policy';
import { ApiResponse } from '../../utils/ApiResponse';

export class SettingsController {
  getPublicSettings = async (_req: Request, res: Response): Promise<void> => {
    const publicSettings = await SellerAccessPolicy.getPublicSettings();
    res.status(200).json(ApiResponse.success(publicSettings));
  };
}

export default SettingsController;
