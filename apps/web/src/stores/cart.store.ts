import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Book } from '@bookmarket/types';
import { apiClient } from '@/lib/api-client';

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  fetchCart: (isAuthenticated: boolean) => Promise<void>;
  addItem: (isAuthenticated: boolean, book: Book, quantity?: number) => Promise<void>;
  updateQuantity: (isAuthenticated: boolean, listingId: string, quantity: number) => Promise<void>;
  removeItem: (isAuthenticated: boolean, listingId: string) => Promise<void>;
  syncCart: () => Promise<void>;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,

      fetchCart: async (isAuthenticated) => {
        if (!isAuthenticated) return;
        set({ isLoading: true, error: null });
        try {
          const cart = await apiClient('/cart');
          set({ items: cart.items, isLoading: false });
        } catch (err) {
          const error = err as Error;
          set({ error: error.message || 'Failed to fetch cart', isLoading: false });
        }
      },

      addItem: async (isAuthenticated, book, quantity = 1) => {
        set({ isLoading: true, error: null });
        try {
          if (isAuthenticated) {
            const cart = await apiClient('/cart/items', {
              method: 'POST',
              body: JSON.stringify({ listingId: book.id, quantity }),
            });
            set({ items: cart.items, isLoading: false });
          } else {
            const currentItems = [...get().items];
            const existingIndex = currentItems.findIndex((item) => item.listingId === book.id);

            if (existingIndex > -1) {
              const newQty = currentItems[existingIndex].quantity + quantity;
              if (book.stock < newQty) {
                throw new Error(`Insufficient stock. Only ${book.stock} items left.`);
              }
              currentItems[existingIndex].quantity = newQty;
            } else {
              if (book.stock < quantity) {
                throw new Error(`Insufficient stock. Only ${book.stock} items left.`);
              }
              currentItems.push({
                listingId: book.id,
                quantity,
                priceSnapshot: book.price,
                listingDetail: {
                  id: book.id,
                  condition: book.condition,
                  price: book.price,
                  stock: book.stock,
                  sellerId: book.sellerId,
                  catalog: {
                    title: book.title,
                    author: book.author,
                    isbn: book.isbn,
                    images: book.images,
                    slug: book.slug,
                  },
                },
              });
            }
            set({ items: currentItems, isLoading: false });
          }
        } catch (err) {
          const error = err as Error;
          set({ error: error.message || 'Failed to add item', isLoading: false });
          throw error;
        }
      },

      updateQuantity: async (isAuthenticated, listingId, quantity) => {
        set({ isLoading: true, error: null });
        try {
          if (isAuthenticated) {
            const cart = await apiClient(`/cart/items/${listingId}`, {
              method: 'PATCH',
              body: JSON.stringify({ quantity }),
            });
            set({ items: cart.items, isLoading: false });
          } else {
            const currentItems = [...get().items];
            const existingIndex = currentItems.findIndex((item) => item.listingId === listingId);
            if (existingIndex > -1) {
              const stock = currentItems[existingIndex].listingDetail?.stock || 999;
              if (stock < quantity) {
                throw new Error(`Insufficient stock. Only ${stock} items left.`);
              }
              currentItems[existingIndex].quantity = quantity;
            }
            set({ items: currentItems, isLoading: false });
          }
        } catch (err) {
          const error = err as Error;
          set({ error: error.message || 'Failed to update quantity', isLoading: false });
          throw error;
        }
      },

      removeItem: async (isAuthenticated, listingId) => {
        set({ isLoading: true, error: null });
        try {
          if (isAuthenticated) {
            const cart = await apiClient(`/cart/items/${listingId}`, {
              method: 'DELETE',
            });
            set({ items: cart.items, isLoading: false });
          } else {
            const currentItems = get().items.filter((item) => item.listingId !== listingId);
            set({ items: currentItems, isLoading: false });
          }
        } catch (err) {
          const error = err as Error;
          set({ error: error.message || 'Failed to remove item', isLoading: false });
          throw error;
        }
      },

      syncCart: async () => {
        const guestItems = get().items.map((item) => ({
          listingId: item.listingId,
          quantity: item.quantity,
        }));

        if (guestItems.length === 0) return;

        try {
          const cart = await apiClient('/cart/merge', {
            method: 'POST',
            body: JSON.stringify({ items: guestItems }),
          });
          set({ items: cart.items });
        } catch (err) {
          console.error('Failed to merge cart:', err);
        }
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'bookmarket-cart',
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);
