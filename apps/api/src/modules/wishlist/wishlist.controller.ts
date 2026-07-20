import { Request, Response } from 'express';
import { WishlistService } from './wishlist.service';
import { ApiResponse } from '../../utils/ApiResponse';

export class WishlistController {
  private wishlistService: WishlistService;

  constructor() {
    this.wishlistService = new WishlistService();
  }

  getWishlist = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const result = await this.wishlistService.getWishlist(userId);
    res.status(200).json(ApiResponse.success(result));
  };

  add = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { bookId } = req.params;
    const wishlist = await this.wishlistService.addToWishlist(userId, bookId);
    res.status(200).json(ApiResponse.success(wishlist));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { bookId } = req.params;
    const wishlist = await this.wishlistService.removeFromWishlist(userId, bookId);
    res.status(200).json(ApiResponse.success(wishlist));
  };
}
export default WishlistController;
