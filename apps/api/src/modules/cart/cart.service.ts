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
    let listing = await this.listingRepository.findById(listingId);
    if (!listing || listing.status !== 'active') {
      const activeListings = await this.listingRepository.findByCatalogId(listingId);
      if (activeListings && activeListings.length > 0) {
        listing = activeListings[0];
      }
    }

    if (!listing || listing.status !== 'active') {
      throw new NotFoundError('Book listing not found or is inactive');
    }

    const actualListingId = listing._id.toString();

    if (listing.stock < quantity) {
      throw new ValidationError(`Insufficient stock. Only ${listing.stock} copies available.`);
    }

    let cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      cart = await this.cartRepository.create(userId);
    }

    const items = [...cart.items];
    const existingIndex = items.findIndex(
      (item) => this.getListingIdStr(item.listingId) === actualListingId
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
        listingId: new mongoose.Types.ObjectId(actualListingId),
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

    let listing = await this.listingRepository.findById(listingId);
    if (!listing) {
      const activeListings = await this.listingRepository.findByCatalogId(listingId);
      if (activeListings && activeListings.length > 0) {
        listing = activeListings[0];
      }
    }
    if (!listing) throw new NotFoundError('Book listing not found');

    const actualListingId = listing._id.toString();

    const items = [...cart.items];
    const itemIndex = items.findIndex(
      (item) =>
        this.getListingIdStr(item.listingId) === actualListingId ||
        this.getListingIdStr(item.listingId) === listingId
    );
    if (itemIndex === -1) throw new NotFoundError('Item not found in cart');

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

    let listing = await this.listingRepository.findById(listingId);
    if (!listing) {
      const activeListings = await this.listingRepository.findByCatalogId(listingId);
      if (activeListings && activeListings.length > 0) {
        listing = activeListings[0];
      }
    }

    const actualListingId = listing ? listing._id.toString() : listingId;

    const items = cart.items.filter(
      (item) =>
        this.getListingIdStr(item.listingId) !== actualListingId &&
        this.getListingIdStr(item.listingId) !== listingId
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
      let listing = await this.listingRepository.findById(guestItem.listingId);
      if (!listing || listing.status !== 'active') {
        const activeListings = await this.listingRepository.findByCatalogId(guestItem.listingId);
        if (activeListings && activeListings.length > 0) {
          listing = activeListings[0];
        }
      }
      if (!listing || listing.status !== 'active') continue;

      const actualListingId = listing._id.toString();

      const existingIndex = items.findIndex(
        (item) => this.getListingIdStr(item.listingId) === actualListingId
      );
      if (existingIndex > -1) {
        const totalQty = items[existingIndex].quantity + guestItem.quantity;
        items[existingIndex].quantity = Math.min(totalQty, listing.stock);
        items[existingIndex].priceSnapshot = listing.price;
      } else {
        items.push({
          listingId: new mongoose.Types.ObjectId(actualListingId),
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
        const idStr = listingDoc?._id ? listingDoc._id.toString() : listingDoc?.toString() ?? '';
        return {
          listingId: idStr,
          bookId: idStr,
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

  async getCartSummary(userId: string): Promise<{
    items: Array<CartItem & { isAvailable: boolean; currentPrice: number; priceChanged: boolean }>;
    subtotal: number;
    shippingFee: number;
    tax: number;
    total: number;
    warnings: string[];
  }> {
    const cart = await this.getOrCreateCart(userId);
    const enrichedItems: Array<CartItem & { isAvailable: boolean; currentPrice: number; priceChanged: boolean }> = [];
    const warnings: string[] = [];
    let subtotal = 0;

    for (const item of cart.items) {
      let listing = await this.listingRepository.findById(item.listingId);
      if (!listing) {
        const activeListings = await this.listingRepository.findByCatalogId(item.listingId);
        if (activeListings && activeListings.length > 0) {
          listing = activeListings[0];
        }
      }

      const isAvailable = Boolean(listing && listing.status === 'active' && listing.stock >= item.quantity);
      const currentPrice = listing?.price ?? item.priceSnapshot ?? 0;
      const priceChanged = Boolean(item.priceSnapshot && listing && listing.price !== item.priceSnapshot);

      if (!isAvailable) {
        const title = (item.listingDetail?.catalog as any)?.title || 'A book in your cart';
        warnings.push(`"${title}" is currently out of stock or unavailable.`);
      } else if (priceChanged) {
        const title = (item.listingDetail?.catalog as any)?.title || 'A book in your cart';
        warnings.push(`Price for "${title}" changed from ₹${item.priceSnapshot} to ₹${currentPrice}.`);
      }

      if (isAvailable) {
        subtotal += currentPrice * item.quantity;
      }

      enrichedItems.push({
        ...item,
        isAvailable,
        currentPrice,
        priceChanged,
      });
    }

    const shippingFee = subtotal > 499 || subtotal === 0 ? 0 : 49;
    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    const total = parseFloat((subtotal + shippingFee + tax).toFixed(2));

    return {
      items: enrichedItems,
      subtotal,
      shippingFee,
      tax,
      total,
      warnings,
    };
  }
}
export default CartService;
