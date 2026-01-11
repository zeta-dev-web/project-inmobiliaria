import { DEFAULT_PAGINATION } from '@/src/constants/pagination.constants';

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  recordsPerPage: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
}

export function getPaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(DEFAULT_PAGINATION.PAGE, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || DEFAULT_PAGINATION.PAGE_SIZE.toString())));
  const search = searchParams.get('search') || undefined;

  return { page, limit, search };
}

export function createPaginatedResponse<T>(
  data: T[],
  totalRecords: number,
  currentPage: number,
  recordsPerPage: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const hasNextPage = currentPage < totalPages;
  
  return {
    data,
    currentPage,
    recordsPerPage,
    totalRecords,
    totalPages,
    hasNextPage,
  };
}