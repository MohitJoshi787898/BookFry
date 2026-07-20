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
    const { bookId, quantity } = req.body;
    const cart = await this.cartService.addToCart(userId, bookId, quantity);
    res.status(200).json(ApiResponse.success(cart));
  };

  updateItem = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { bookId } = req.params;
    const { quantity } = req.body;
    const cart = await this.cartService.updateItemQuantity(userId, bookId, quantity);
    res.status(200).json(ApiResponse.success(cart));
  };

  removeItem = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { bookId } = req.params;
    const cart = await this.cartService.removeItem(userId, bookId);
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
