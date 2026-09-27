'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { PublicPlatformSettings } from '@bookmarket/types';

export function usePlatformSettings() {
  const { data, isLoading, isError, refetch } = useQuery<PublicPlatformSettings>({
    queryKey: ['public-platform-settings'],
    queryFn: () => apiClient<PublicPlatformSettings>('/settings/public'),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  return {
    settings: data,
    sellerRegistrationEnabled: data?.sellerRegistrationEnabled ?? false,
    sellerLoginEnabled: data?.sellerLoginEnabled ?? false,
    maintenanceMode: data?.maintenanceMode ?? false,
    supportEmail: data?.supportEmail,
    supportPhone: data?.supportPhone,
    isLoading,
    isError,
    refetch,
  };
}

export default usePlatformSettings;
