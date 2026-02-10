export interface DashboardResponse {
  overview: OverviewStats;
  topProducts: TopProductResponse[];
  categoryStats: CategoryStatsResponse[];
  lowStockProducts: LowStockProductResponse[];
  recentOrders: RecentOrderResponse[];
}

export interface OverviewStats {
  totalRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  totalOrders: number;
  todayOrders: number;
  weekOrders: number;
  monthOrders: number;
  totalUsers: number;
  newUsersToday: number;
  newUsersWeek: number;
  newUsersMonth: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalItemsSold: number;
}

export interface TopProductResponse {
  productId: number;
  productTitle: string;
  productUrl: string;
  price: number;
  totalSold: number;
  totalRevenue: number;
  categoryName: string;
}

export interface CategoryStatsResponse {
  categoryId: number;
  categoryName: string;
  productCount: number;
  totalSold: number;
  totalRevenue: number;
}

export interface LowStockProductResponse {
  productId: number;
  productTitle: string;
  productUrl: string;
  currentStock: number;
  price: number;
  categoryName: string;
}

export interface RecentOrderResponse {
  orderId: number;
  userId: number;
  userEmail: string;
  userName: string;
  totalAmount: number;
  status: string;
  itemCount: number;
  createdAt: string;
  items: OrderItemResponse[];
}

export interface OrderItemResponse {
  productId: number;
  productTitle: string;
  quantity: number;
  priceAtPurchase: number;
}
