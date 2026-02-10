import { CartItem } from './cart.model';

export interface PurchasedProductResponse {
  id: number;
  productId: number;
  productTitle: string;
  productDescription: string;
  productPrice: number;
  productUrl: string;
  quantity: number;
  purchasedAt: string;
}

export interface PurchaseProductRequest {
  productId: number;
  quantity: number;
}

export interface BulkPurchaseRequest {
  products: PurchaseProductRequest[];
}

export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface PaymentDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolderName: string;
}

export interface Order {
  id: number;
  createdAt: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  shippingAddress?: string;
  paymentMethod?: string;
}
