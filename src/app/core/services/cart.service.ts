import { Injectable, signal, computed } from '@angular/core';
import { CartItem, Cart, Product } from '../models';

const CART_STORAGE_KEY = 'tomato_cart';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSignal = signal<CartItem[]>([]);

  readonly cartItems = this.cartItemsSignal.asReadonly();

  readonly cartTotal = computed(() =>
    this.cartItemsSignal().reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    )
  );

  readonly cartCount = computed(() =>
    this.cartItemsSignal().reduce((count, item) => count + item.quantity, 0)
  );

  readonly cart = computed<Cart>(() => ({
    items: this.cartItemsSignal(),
    total: this.cartTotal()
  }));

  constructor() {
    this.loadCart();
  }

  private loadCart(): void {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      this.cartItemsSignal.set(JSON.parse(stored));
    }
  }

  private saveCart(): void {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.cartItemsSignal()));
  }

  addToCart(product: Product, quantity: number = 1): void {
    const items = this.cartItemsSignal();
    const existingIndex = items.findIndex(item => item.product.id === product.id);

    if (existingIndex !== -1) {
      const newItems = [...items];
      newItems[existingIndex] = {
        ...newItems[existingIndex],
        quantity: newItems[existingIndex].quantity + quantity
      };
      this.cartItemsSignal.set(newItems);
    } else {
      this.cartItemsSignal.set([...items, { product, quantity }]);
    }

    this.saveCart();
  }

  removeFromCart(productId: number): void {
    const items = this.cartItemsSignal().filter(item => item.product.id !== productId);
    this.cartItemsSignal.set(items);
    this.saveCart();
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const items = this.cartItemsSignal();
    const index = items.findIndex(item => item.product.id === productId);

    if (index !== -1) {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], quantity };
      this.cartItemsSignal.set(newItems);
      this.saveCart();
    }
  }

  clearCart(): void {
    this.cartItemsSignal.set([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }

  isInCart(productId: number): boolean {
    return this.cartItemsSignal().some(item => item.product.id === productId);
  }

  getCartItem(productId: number): CartItem | undefined {
    return this.cartItemsSignal().find(item => item.product.id === productId);
  }
}
