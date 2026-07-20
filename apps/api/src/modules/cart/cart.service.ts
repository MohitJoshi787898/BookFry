import { CartRepository } from './cart.repository';
import { BooksRepository } from '../books/books.repository';
import { ICartDocument } from '../../models/cart.model';
import { NotFoundError, ValidationError } from '../../utils/AppError';
import { Cart, CartItem } from '@bookmarket/types';
import mongoose from 'mongoose';

export class CartService {
  private cartRepository: CartRepository;
  private booksRepository: BooksRepository;

  constructor() {
    this.cartRepository = new CartRepository();
    this.booksRepository = new BooksRepository();
  }

  private getBookIdStr(bookIdField: any): string {
    if (!bookIdField) return '';
    return bookIdField._id ? bookIdField._id.toString() : bookIdField.toString();
  }

  async getOrCreateCart(userId: string): Promise<Cart> {
    let doc = await this.cartRepository.findByUserId(userId);
    if (!doc) {
      doc = await this.cartRepository.create(userId);
    }
    return this.mapToDTO(doc);
  }

  async addToCart(userId: string, bookId: string, quantity: number): Promise<Cart> {
    const book = await this.booksRepository.findById(bookId);
    if (!book || book.status !== 'active') {
      throw new NotFoundError('Book listing not found or is inactive');
    }

    if (book.stock < quantity) {
      throw new ValidationError(`Insufficient stock. Only ${book.stock} items left.`);
    }

    let cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      cart = await this.cartRepository.create(userId);
    }

    const items = [...cart.items];
    const existingIndex = items.findIndex((item) => this.getBookIdStr(item.bookId) === bookId);

    if (existingIndex > -1) {
      const newQty = items[existingIndex].quantity + quantity;
      if (book.stock < newQty) {
        throw new ValidationError(
          `Insufficient stock. Total requested quantity exceeds available stock.`
        );
      }
      items[existingIndex].quantity = newQty;
      items[existingIndex].priceSnapshot = book.price;
    } else {
      items.push({
        bookId: new mongoose.Types.ObjectId(bookId),
        quantity,
        priceSnapshot: book.price,
      } as any);
    }

    const updated = await this.cartRepository.update(userId, items);
    return this.mapToDTO(updated!);
  }

  async updateItemQuantity(userId: string, bookId: string, quantity: number): Promise<Cart> {
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    const items = [...cart.items];
    const itemIndex = items.findIndex((item) => this.getBookIdStr(item.bookId) === bookId);
    if (itemIndex === -1) {
      throw new NotFoundError('Item not found in cart');
    }

    const book = await this.booksRepository.findById(bookId);
    if (!book) {
      throw new NotFoundError('Book listing not found');
    }

    if (book.stock < quantity) {
      throw new ValidationError(`Insufficient stock. Only ${book.stock} items left.`);
    }

    items[itemIndex].quantity = quantity;
    items[itemIndex].priceSnapshot = book.price;

    const updated = await this.cartRepository.update(userId, items);
    return this.mapToDTO(updated!);
  }

  async removeItem(userId: string, bookId: string): Promise<Cart> {
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    const items = cart.items.filter((item) => this.getBookIdStr(item.bookId) !== bookId);
    const updated = await this.cartRepository.update(userId, items);
    return this.mapToDTO(updated!);
  }

  async mergeCarts(
    userId: string,
    guestItems: Array<{ bookId: string; quantity: number }>
  ): Promise<Cart> {
    let cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      cart = await this.cartRepository.create(userId);
    }

    const items = [...cart.items];

    for (const guestItem of guestItems) {
      const book = await this.booksRepository.findById(guestItem.bookId);
      if (!book || book.status !== 'active') continue;

      const existingIndex = items.findIndex(
        (item) => this.getBookIdStr(item.bookId) === guestItem.bookId
      );
      if (existingIndex > -1) {
        const totalQty = items[existingIndex].quantity + guestItem.quantity;
        items[existingIndex].quantity = Math.min(totalQty, book.stock);
        items[existingIndex].priceSnapshot = book.price;
      } else {
        items.push({
          bookId: new mongoose.Types.ObjectId(guestItem.bookId),
          quantity: Math.min(guestItem.quantity, book.stock),
          priceSnapshot: book.price,
        } as any);
      }
    }

    const updated = await this.cartRepository.update(userId, items);
    return this.mapToDTO(updated!);
  }

  mapToDTO(doc: ICartDocument): Cart {
    const items: CartItem[] = doc.items
      .filter((item) => item.bookId !== null)
      .map((item) => {
        const bookDoc = item.bookId as any;
        return {
          bookId: bookDoc._id ? bookDoc._id.toString() : bookDoc.toString(),
          quantity: item.quantity,
          priceSnapshot: item.priceSnapshot,
          bookDetail: bookDoc._id
            ? {
                id: bookDoc._id.toString(),
                title: bookDoc.title,
                slug: bookDoc.slug,
                author: bookDoc.author,
                isbn: bookDoc.isbn,
                category: bookDoc.category ? bookDoc.category.toString() : '',
                condition: bookDoc.condition,
                price: bookDoc.price,
                discountPrice: bookDoc.discountPrice,
                images: bookDoc.images,
                stock: bookDoc.stock,
                sellerId: bookDoc.sellerId ? bookDoc.sellerId.toString() : '',
                status: bookDoc.status,
              }
            : undefined,
        };
      });

    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      items,
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
export default CartService;
