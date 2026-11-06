export interface PaginationQuery {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  currentPage: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Converts 1-based page numbers into Prisma skip/take values.
 */
export function getPagination(page: number, limit: number): { skip: number; take: number } {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  return {
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
  };
}

/**
 * Builds pagination metadata for API responses.
 */
export function buildPaginationMeta(
  page: number,
  limit: number,
  totalItems: number,
): PaginationMeta {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit));

  return {
    currentPage: safePage,
    limit: safeLimit,
    totalItems,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
  };
}
