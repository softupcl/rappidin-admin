export interface Role {
  id: number;
  name: string;
}

export interface UserRole {
  id: number;
  userId: number;
  roleId: number;
  role: Role;
}

export interface User {
  id: number;
  email: string;
  name: string;
  lastname: string;
  phone?: string;
  image?: string;
  isActive: boolean;
  isOnline?: boolean;
  lastSeen?: string;
  roles: UserRole[];
  createdAt: string;
}

export type UserRoleFilter = 'all' | 'restaurante' | 'repartidor';

export const ROLE_MAPPINGS = {
  restaurante: 'RESTAURANTE',
  repartidor: 'REPARTIDOR',
} as const;

export interface Category {
  id: number;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  products?: Product[];
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image1?: string;
  image2?: string;
  image3?: string;
  stock: number;
  isActive: boolean;
  categoryId: number;
  category?: Category;
}

export interface Address {
  id: number;
  address: string;
  neighborhood: string;
  lat: number;
  lng: number;
}

export interface OrderProduct {
  id: number;
  quantity: number;
  productId: number;
  product?: Product;
}

export interface Order {
  id: number;
  status: OrderStatus;
  notes?: string;
  estimatedDeliveryAt?: string;
  timestamp: number;
  lat?: number;
  lng?: number;
  takenAt?: string;
  deliveredAt?: string;
  paymentMethod?: string;
  clientId: number;
  deliveryId?: number;
  addressId: number;
  client?: User;
  delivery?: User;
  address?: Address;
  products: OrderProduct[];
}

export type OrderStatus = 'PENDIENTE' | 'EN PREPARACION' | 'DESPACHADO' | 'EN CAMINO' | 'ENTREGADO' | 'CANCELADO';

export interface BusinessConfig {
  id: number;
  name: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  openingTime: string;
  closingTime: string;
  minDeliveryFee: number;
  deliveryRadius: number;
  primaryColor: string;
  isActive: boolean;
}

export interface Delivery {
  id: number;
  user: User;
  isAvailable: boolean;
  isOnline: boolean;
  currentLat?: number;
  currentLng?: number;
  activeOrders: number;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  totalUsers: number;
  totalProducts: number;
  totalDeliveries: number;
  todayRevenue: number;
  yesterdayRevenue: number;
  avgOrderValue: number;
  cancellationRate: number;
  ordersByStatus: { status: string; count: number }[];
  recentOrders: Order[];
  topProducts: (Product & { totalQuantity: number; totalOrders: number })[];
  topDeliveries: { name: string; lastname: string; phone?: string; image?: string; completedDeliveries: number }[];
  weeklyRevenue: { date: string; revenue: number; orders: number }[];
  monthlyRevenue: number;
  lowStockProducts: { id: number; name: string; stock: number; price: number }[];
  revenueChange: number;
}