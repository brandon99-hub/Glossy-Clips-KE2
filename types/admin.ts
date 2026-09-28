// Admin Dashboard & Management Types

export interface AdminAnalyticsSummary {
  totalRevenue: number
  totalOrders: number
  pendingOrders: number
  paidOrders: number
  packedOrders: number
  collectedOrders: number
  lowStockCount: number
  waitlistCount: number
}

export interface AdminPagination {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface AdminFilterState {
  searchQuery?: string
  statusFilter?: string
  categoryFilter?: string
  dateRange?: {
    from: string
    to: string
  }
}
