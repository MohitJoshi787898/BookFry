import { Request, Response } from 'express';
import { CartService } from './cart.service';
import { ApiResponse } from '../../utils/ApiResponse';

export class CartController {
  private cartService: CartService;

  constructor() {
    this.cartService = new CartService();
  }

  get = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const cart = await this.cartService.getOrCreateCart(userId);
    res.status(200).json(ApiResponse.success(cart));
  };

  addItem = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const targetListingId = req.body.listingId || req.body.bookId;
    const quantity = req.body.quantity;
    const cart = await this.cartService.addToCart(userId, targetListingId, quantity);
    res.status(200).json(ApiResponse.success(cart));
  };

  updateItem = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { listingId } = req.params;
    const { quantity } = req.body;
    const cart = await this.cartService.updateItemQuantity(userId, listingId, quantity);
    res.status(200).json(ApiResponse.success(cart));
  };

  removeItem = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { listingId } = req.params;
    const cart = await this.cartService.removeItem(userId, listingId);
    res.status(200).json(ApiResponse.success(cart));
  };

  merge = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { items } = req.body;
    const cart = await this.cartService.mergeCarts(userId, items);
    res.status(200).json(ApiResponse.success(cart));
  };
}
export default CartController;
