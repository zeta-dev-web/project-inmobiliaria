import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { propertyService } from '@/src/services/property.service';
import { handleClientError } from '@/src/utils/handlers/clientError.handler';
import { DEFAULT_PAGINATION } from '@/src/constants/pagination.constants';

export function useProperties() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data,
    isLoading: loading,
    error,
    refetch,
    isFetching,
    isRefetching,
  } = useQuery({
    queryKey: ['properties', page, searchQuery],
    queryFn: async () => {
      try {
        return await propertyService.getProperties({
          page,
          limit: DEFAULT_PAGINATION.PAGE_SIZE,
          search: searchQuery,
        });
      } catch (clientError: unknown) {
        handleClientError(clientError);
        throw clientError;
      }
    },
    placeholderData: keepPreviousData,
    enabled: searchQuery.length === 0 || searchQuery.length >= 3,
  });

  const goToPage = (newPage: number) => {
    setPage(newPage);
  };

  const search = (newSearchQuery: string) => {
    setSearchQuery(newSearchQuery);
    setPage(1);
  };

  return {
    data,
    loading,
    isFetching,
    isRefetching,
    error: error?.message || null,
    page,
    searchQuery,
    goToPage,
    search,
    refetch,
  };
}