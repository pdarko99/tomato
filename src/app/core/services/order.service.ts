import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, of } from 'rxjs';
import {
  ApiResponse,
  PurchasedProductResponse,
  BulkPurchaseRequest,
  Order,
  OrderStatus,
  PaymentDetails,
  CartItem
} from '../models';
import { CartService } from './cart.service';
import { environment } from '../config/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private cartService = inject(CartService);
  private apiUrl = environment.apiUrl;

  private purchasesSignal = signal<PurchasedProductResponse[]>([]);
  private ordersSignal = signal<Order[]>([]);

  readonly purchases = this.purchasesSignal.asReadonly();
  readonly orders = this.ordersSignal.asReadonly();

  fetchPurchases(): Observable<PurchasedProductResponse[]> {
    return this.http.get<ApiResponse<PurchasedProductResponse[]>>(`${this.apiUrl}/api/purchased-products`).pipe(
      map(response => response.data || []),
      tap(purchases => {
        this.purchasesSignal.set(purchases);
        this.ordersSignal.set(this.groupPurchasesIntoOrders(purchases));
      }),
      catchError(() => of([] as PurchasedProductResponse[]))
    );
  }

  purchaseBulk(request: BulkPurchaseRequest): Observable<PurchasedProductResponse[] | null> {
    return this.http.post<ApiResponse<PurchasedProductResponse[]>>(
      `${this.apiUrl}/api/purchased-products/bulk`,
      request
    ).pipe(
      map(response => response.data),
      tap(() => this.cartService.clearCart()),
      catchError(() => of(null))
    );
  }

  getUserOrders(): Observable<Order[]> {
    return this.fetchPurchases().pipe(
      map(purchases => this.groupPurchasesIntoOrders(purchases))
    );
  }

  getAllOrders(): Order[] {
    return this.ordersSignal();
  }

  getOrderStats(): { totalOrders: number; totalRevenue: number; pendingOrders: number } {
    const orders = this.ordersSignal();
    return {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
      pendingOrders: orders.filter(o => o.status === 'PENDING' || o.status === 'pending').length
    };
  }

  createOrder(paymentDetails: PaymentDetails, shippingAddress: string): Observable<Order | null> {
    const cartItems = this.cartService.cartItems();
    const request: BulkPurchaseRequest = {
      products: cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }))
    };

    return this.purchaseBulk(request).pipe(
      map(purchases => {
        if (!purchases) return null;
        const order: Order = {
          id: purchases[0]?.id || Date.now(),
          createdAt: new Date().toISOString(),
          items: [...cartItems],
          total: cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
          status: 'COMPLETED' as OrderStatus,
          shippingAddress,
          paymentMethod: `Card ending in ${paymentDetails.cardNumber.slice(-4)}`
        };
        return order;
      })
    );
  }

  private groupPurchasesIntoOrders(purchases: PurchasedProductResponse[]): Order[] {
    const orderMap = new Map<string, PurchasedProductResponse[]>();

    for (const purchase of purchases) {
      const key = purchase.purchasedAt;
      if (!orderMap.has(key)) {
        orderMap.set(key, []);
      }
      orderMap.get(key)!.push(purchase);
    }

    return Array.from(orderMap.entries())
      .map(([purchasedAt, items]) => ({
        id: items[0].id,
        createdAt: purchasedAt,
        items: items.map(p => ({
          product: {
            id: p.productId,
            title: p.productTitle,
            description: p.productDescription || '',
            price: p.productPrice,
            productUrl: p.productUrl || '',
            inStock: true,
            quantity: p.quantity,
            categoryId: 0,
            categoryName: ''
          },
          quantity: p.quantity
        } as CartItem)),
        total: items.reduce((sum, p) => sum + p.productPrice * p.quantity, 0),
        status: 'COMPLETED' as OrderStatus
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}
