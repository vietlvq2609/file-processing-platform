export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiSingleResponse<T> {
  data: T
}

export interface ApiListResponse<T> {
  data: T[]
  meta: PaginationMeta
}
