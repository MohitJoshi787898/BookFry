import { CartRepository } from './cart.repository';
import { ListingRepository } from '../books/listing.repository';
import { ICartDocument } from '../../models/cart.model';
import { NotFoundError, ValidationError } from '../../utils/AppError';
import { Cart, CartItem } from '@bookmarket/types';
import mongoose from 'mongoose';

export class CartService {
  private cartRepository: CartRepository;
  private listingRepository: ListingRepository;

  constructor() {
    this.cartRepository = new CartRepository();
    this.listingRepository = new ListingRepository();
  }

  private getListingIdStr(listingIdField: any): string {
    if (!listingIdField) return '';
    return listingIdField._id ? listingIdField._id.toString() : listingIdField.toString();
  }

  async getOrCreateCart(userId: string): Promise<Cart> {
    let doc = await this.cartRepository.findByUserId(userId);
    if (!doc) {
      doc = await this.cartRepository.create(userId);
    }
    return this.mapToDTO(doc);
  }

  async addToCart(userId: string, listingId: string, quantity: number): Promise<Cart> {
    const listing = await this.listingRepository.findById(listingId);
    if (!listing || listing.status !== 'active') {
      throw new NotFoundError('Book listing not found or is inactive');
    }

    if (listing.stock < quantity) {
      throw new ValidationError(`Insufficient stock. Only ${listing.stock} copies available.`);
    }

    let cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      cart = await this.cartRepository.create(userId);
    }

    const items = [...cart.items];
    const existingIndex = items.findIndex(
      (item) => this.getListingIdStr(item.listingId) === listingId
    );

    if (existingIndex > -1) {
      const newQty = items[existingIndex].quantity + quantity;
      if (listing.stock < newQty) {
        throw new ValidationError(
          `Insufficient stock. Total requested quantity exceeds available stock.`
        );
      }
      items[existingIndex].quantity = newQty;
      items[existingIndex].priceSnapshot = listing.price;
    } else {
      items.push({
        listingId: new mongoose.Types.ObjectId(listingId),
        quantity,
        priceSnapshot: listing.price,
      } as any);
    }

    const updated = await this.cartRepository.update(userId, items);
    return this.mapToDTO(updated!);
  }

  async updateItemQuantity(userId: string, listingId: string, quantity: number): Promise<Cart> {
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) throw new NotFoundError('Cart not found');

    const items = [...cart.items];
    const itemIndex = items.findIndex(
      (item) => this.getListingIdStr(item.listingId) === listingId
    );
    if (itemIndex === -1) throw new NotFoundError('Item not found in cart');

    const listing = await this.listingRepository.findById(listingId);
    if (!listing) throw new NotFoundError('Book listing not found');

    if (listing.stock < quantity) {
      throw new ValidationError(`Insufficient stock. Only ${listing.stock} copies available.`);
    }

    items[itemIndex].quantity = quantity;
    items[itemIndex].priceSnapshot = listing.price;

    const updated = await this.cartRepository.update(userId, items);
    return this.mapToDTO(updated!);
  }

  async removeItem(userId: string, listingId: string): Promise<Cart> {
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) throw new NotFoundError('Cart not found');

    const items = cart.items.filter(
      (item) => this.getListingIdStr(item.listingId) !== listingId
    );
    const updated = await this.cartRepository.update(userId, items);
    return this.mapToDTO(updated!);
  }

  async mergeCarts(
    userId: string,
    guestItems: Array<{ listingId: string; quantity: number }>
  ): Promise<Cart> {
    let cart = await this.cartRepository.findByUserId(userId);
    if (!cart) cart = await this.cartRepository.create(userId);

    const items = [...cart.items];

    for (const guestItem of guestItems) {
      const listing = await this.listingRepository.findById(guestItem.listingId);
      if (!listing || listing.status !== 'active') continue;

      const existingIndex = items.findIndex(
        (item) => this.getListingIdStr(item.listingId) === guestItem.listingId
      );
      if (existingIndex > -1) {
        const totalQty = items[existingIndex].quantity + guestItem.quantity;
        items[existingIndex].quantity = Math.min(totalQty, listing.stock);
        items[existingIndex].priceSnapshot = listing.price;
      } else {
        items.push({
          listingId: new mongoose.Types.ObjectId(guestItem.listingId),
          quantity: Math.min(guestItem.quantity, listing.stock),
          priceSnapshot: listing.price,
        } as any);
      }
    }

    const updated = await this.cartRepository.update(userId, items);
    return this.mapToDTO(updated!);
  }

  mapToDTO(doc: ICartDocument): Cart {
    const items: CartItem[] = doc.items
      .filter((item) => item.listingId !== null)
      .map((item) => {
        const listingDoc = item.listingId as any;
        const catalogDoc = listingDoc?.catalogId as any;
        return {
          listingId: listingDoc?._id ? listingDoc._id.toString() : listingDoc?.toString() ?? '',
          quantity: item.quantity,
          priceSnapshot: item.priceSnapshot,
          listingDetail: listingDoc?._id
            ? {
                id: listingDoc._id.toString(),
                condition: listingDoc.condition,
                price: listingDoc.price,
                stock: listingDoc.stock,
                sellerId: listingDoc.sellerId?.toString() ?? '',
                catalog: catalogDoc?._id
                  ? {
                      title: catalogDoc.title,
                      author: catalogDoc.author,
                      isbn: catalogDoc.isbn,
                      images: catalogDoc.images ?? [],
                      slug: catalogDoc.slug,
                    }
                  : undefined,
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
