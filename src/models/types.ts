export interface PaginatedResponse<T> {
  totalCount: number;
  count: number;
  offset: number;
  limit: number;
  content: T[];
}
