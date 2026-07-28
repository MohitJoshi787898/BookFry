'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Book } from '@bookmarket/types';
import { useAuthStore } from '@/stores/auth.store';
import { useAuthModalStore } from '@/stores/auth-modal.store';

interface WishlistResponse {
  items: Array<{
    id: string;
    bookId: string;
    book?: Book;
    addedAt: string;
  }>;
}

export function useWishlist() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const openModal = useAuthModalStore((state) => state.openModal);

  const wishlistQuery = useQuery<WishlistResponse>({
    queryKey: ['wishlist'],
    queryFn: () => apiClient('/wishlist'),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const wishlistItems = wishlistQuery.data?.items || [];
  const wishlistedBookIds = new Set(wishlistItems.map((item) => item.bookId || (item.book?.id)));

  const addToWishlistMutation = useMutation({
    mutationFn: (bookId: string) =>
      apiClient('/wishlist/items', {
        method: 'POST',
        body: JSON.stringify({ bookId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: (bookId: string) =>
      apiClient(`/wishlist/items/${bookId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const toggleWishlist = async (bookId: string) => {
    if (!isAuthenticated) {
      openModal('login');
      return;
    }

    if (wishlistedBookIds.has(bookId)) {
      await removeFromWishlistMutation.mutateAsync(bookId);
    } else {
      await addToWishlistMutation.mutateAsync(bookId);
    }
  };

  return {
    items: wishlistItems,
    wishlistedBookIds,
    count: wishlistItems.length,
    isLoading: wishlistQuery.isLoading,
    toggleWishlist,
    isWishlisted: (bookId: string) => wishlistedBookIds.has(bookId),
  };
}
