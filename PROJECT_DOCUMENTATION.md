# Tomato - E-Commerce Platform

> A full-stack e-commerce application built with Angular 21, featuring dual-role support (Customer & Admin), real-time cart management, session handling, and an analytics dashboard.

**Live Backend:** Deployed on Railway
**Frontend Framework:** Angular 21 (Standalone Components, Signals)
**UI Library:** PrimeNG 21

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Features](#features)
- [Data Models](#data-models)
- [Routing & Navigation](#routing--navigation)
- [State Management](#state-management)
- [Security](#security)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Screenshots / Key Flows](#screenshots--key-flows)

---

## Overview

Tomato is a modern e-commerce platform that supports two user roles:

- **Customers** can browse products, search with debounced input, manage a persistent cart, checkout with shipping/payment details, and view order history.
- **Admins** access a dedicated dashboard with revenue analytics, product/category CRUD management, stock monitoring, and order tracking.

The application emphasizes modern Angular practices including standalone components, signals-based reactivity, lazy-loaded routes, and functional guards/interceptors.

---

## Tech Stack

| Layer              | Technology                                       |
|--------------------|--------------------------------------------------|
| Framework          | Angular 21.1 (Standalone Components)             |
| Language           | TypeScript 5.9                                   |
| State Management   | Angular Signals + RxJS 7.8                       |
| UI Components      | PrimeNG 21, PrimeIcons, PrimeFlex                |
| Charting           | Chart.js 4.5                                     |
| Styling            | SCSS with component-scoped styles                |
| Code Formatting    | Prettier (Angular HTML parser)                   |
| Backend            | REST API deployed on Railway                     |
| Auth               | JWT Bearer Token (HTTP Interceptor)              |

---

## Architecture

The project follows a **Feature-Sliced Design** with a clean separation between core services, feature modules, and shared UI components.

```
src/app/
├── core/                    # Singleton services, guards, interceptors, models
│   ├── config/              # Environment configuration
│   ├── guards/              # Auth & Admin route guards
│   ├── interceptors/        # JWT auth interceptor
│   ├── models/              # TypeScript interfaces & types
│   └── services/            # Business logic (Auth, Cart, Product, Order, Dashboard, Idle)
│
├── features/                # Lazy-loaded feature modules
│   ├── auth/                # Login & Registration
│   ├── admin/               # Dashboard, Products, Categories, Settings
│   └── user/                # Home, Cart, Checkout, Orders, Settings
│
├── shared/                  # Reusable UI components
│   └── components/          # Responsive Nav, Idle Warning Dialog
│
├── app.ts                   # Root standalone component
├── app.routes.ts            # Top-level route configuration
└── app.config.ts            # Application providers & configuration
```

### Key Architectural Decisions

- **Standalone Components** — No NgModules; all components are self-contained and tree-shakeable.
- **Functional Guards & Interceptors** — Uses `CanActivateFn` and `HttpInterceptorFn` for cleaner, testable route protection and HTTP handling.
- **Signals for Reactive State** — Leverages Angular's `signal()` and `computed()` for synchronous, fine-grained reactivity without excess boilerplate.
- **Lazy-Loaded Routes** — Feature routes are loaded on demand, reducing initial bundle size.
- **Proxy-Based API Integration** — Development uses a proxy configuration to forward API requests to the Railway-hosted backend.

---

## Features

### Customer Experience

| Feature                | Description                                                                 |
|------------------------|-----------------------------------------------------------------------------|
| Product Browsing       | Infinite scroll pagination (5 per page) with smooth loading                 |
| Product Search         | Debounced search input (400ms) with real-time results                       |
| Category Filtering     | Filter products by category                                                 |
| Shopping Cart          | Add/update/remove items with persistent localStorage storage                |
| Cart Badge             | Real-time item count displayed in navigation                                |
| Checkout               | Payment details & shipping address collection with bulk order creation      |
| Order History          | Purchase history grouped by date with item details and totals               |
| Profile Management     | Update personal information and change password                             |
| Session Management     | 15-minute idle timeout with 60-second countdown warning before auto-logout  |
| Cross-Tab Sync         | Logout and session state synchronized across browser tabs via storage events|

### Admin Dashboard

| Feature                | Description                                                                 |
|------------------------|-----------------------------------------------------------------------------|
| Revenue Analytics      | Total, monthly, weekly, and daily revenue overview                          |
| Order Statistics       | Total orders, pending orders, order trend visualization                     |
| Charts                 | Revenue trends (line/bar) and category distribution (pie) via Chart.js      |
| Top Products           | Ranked list of best-selling products                                        |
| Low Stock Alerts       | Notifications for products running low on inventory                         |
| Recent Orders          | Table of latest orders with status tracking                                 |
| Product Management     | Full CRUD with image upload (FormData), stock tracking, category assignment |
| Category Management    | Create, update, delete categories with associated product counts            |

---

## Data Models

```typescript
interface User {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
  expiresAt: number;
  isAdmin?: boolean;
  phone?: string;
  avatar?: string;
  createdAt?: string;
}

interface Product {
  id: number;
  title: string;
  description: string;
  inStock: boolean;
  quantity: number;
  price: number;
  productUrl: string;
  categoryId: number;
  categoryName: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  productCount: number;
  createdAt: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Order {
  id: number;
  createdAt: string;
  items: CartItem[];
  total: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'processing' | 'shipped' | 'delivered';
  shippingAddress?: string;
  paymentMethod?: string;
}

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}
```

---

## Routing & Navigation

### Public Routes

| Path              | Component         | Description          |
|-------------------|-------------------|----------------------|
| `/auth/login`     | LoginComponent    | User login form      |
| `/auth/register`  | RegisterComponent | New user registration|

### Protected Routes (Auth Guard)

| Path         | Component          | Description               |
|--------------|--------------------|---------------------------|
| `/home`      | HomeComponent      | Product listing & search  |
| `/cart`      | CartComponent      | Shopping cart management   |
| `/checkout`  | CheckoutComponent  | Payment & order placement |
| `/orders`    | OrdersComponent    | Purchase history          |
| `/settings`  | SettingsComponent  | Profile management        |

### Admin Routes (Admin Guard)

| Path                | Component              | Description            |
|---------------------|------------------------|------------------------|
| `/admin/dashboard`  | DashboardComponent     | Analytics & metrics    |
| `/admin/products`   | ProductsComponent      | Product CRUD           |
| `/admin/categories` | CategoriesComponent    | Category CRUD          |
| `/admin/settings`   | AdminSettingsComponent | Admin configuration    |

---

## State Management

The application uses **Angular Signals** as the primary state management approach, combined with RxJS for asynchronous side effects.

### Service Breakdown

| Service          | Signals                                  | Responsibilities                                    |
|------------------|------------------------------------------|-----------------------------------------------------|
| AuthService      | `currentUserSignal`                      | Login, register, logout, profile update, token mgmt |
| CartService      | `cartItemsSignal`                        | Add/remove/update cart, computed total & count       |
| ProductService   | `productsSignal`, `categoriesSignal`     | Product & category CRUD, search, pagination          |
| OrderService     | `purchasesSignal`, `ordersSignal`        | Fetch purchases, create orders, order stats          |
| DashboardService | —                                        | Admin dashboard analytics API                       |
| IdleService      | `showWarning`, `countdownSeconds`        | Activity monitoring, session timeout, cross-tab sync|

### Computed Properties (Derived State)

```typescript
// AuthService
isLoggedIn = computed(() => !!this.currentUserSignal());
isAdmin    = computed(() => this.currentUserSignal()?.isAdmin ?? false);

// CartService
cartTotal = computed(() => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0));
cartCount = computed(() => items.reduce((sum, i) => sum + i.quantity, 0));

// OrderService
totalOrders  = computed(() => this.ordersSignal().length);
totalRevenue = computed(() => orders.reduce((sum, o) => sum + o.total, 0));
```

---

## Security

| Mechanism            | Implementation                                                     |
|----------------------|--------------------------------------------------------------------|
| Authentication       | JWT Bearer tokens sent via HTTP interceptor on every request       |
| Route Protection     | Functional `authGuard` and `adminGuard` with redirect logic        |
| Token Storage        | localStorage with dedicated keys                                   |
| Session Timeout      | 15-minute idle detection with activity monitoring across tabs       |
| Request Timeout      | 15-second HTTP timeout on auth requests to prevent hanging          |
| Role-Based Access    | Separate route trees and navigation menus for admin vs customer    |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 10+
- Angular CLI 21+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd tomato

# Install dependencies
npm install

# Start the development server (proxies API to Railway backend)
npm start
```

The app will be available at `http://localhost:4200`.

### Build for Production

```bash
npm run build
```

Output is generated in the `/dist` directory with hashed filenames for cache busting.

### Bundle Budgets

| Type             | Warning  | Error   |
|------------------|----------|---------|
| Initial Bundle   | 2 MB     | 3 MB    |
| Component Styles | 10 kB    | 20 kB   |

---

## Project Structure

```
tomato/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config/
│   │   │   │   ├── environment.ts
│   │   │   │   └── environment.prod.ts
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── admin.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts
│   │   │   ├── models/
│   │   │   │   ├── user.model.ts
│   │   │   │   ├── product.model.ts
│   │   │   │   ├── category.model.ts
│   │   │   │   ├── cart.model.ts
│   │   │   │   └── order.model.ts
│   │   │   └── services/
│   │   │       ├── auth.service.ts
│   │   │       ├── cart.service.ts
│   │   │       ├── product.service.ts
│   │   │       ├── order.service.ts
│   │   │       ├── dashboard.service.ts
│   │   │       └── idle.service.ts
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── admin/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── products/
│   │   │   │   ├── categories/
│   │   │   │   └── settings/
│   │   │   └── user/
│   │   │       ├── home/
│   │   │       ├── cart/
│   │   │       ├── checkout/
│   │   │       ├── orders/
│   │   │       └── settings/
│   │   ├── shared/
│   │   │   └── components/
│   │   │       ├── responsive-nav/
│   │   │       └── idle-warning-dialog/
│   │   ├── app.ts
│   │   ├── app.routes.ts
│   │   └── app.config.ts
│   ├── styles.scss
│   └── index.html
├── proxy.conf.js
├── angular.json
├── tsconfig.json
├── package.json
└── .prettierrc
```

---

## Screenshots / Key Flows

### User Flow

```
Register/Login → Browse Products → Search/Filter → Add to Cart → Checkout → View Orders
```

### Admin Flow

```
Login (admin@tomato.com) → Dashboard Analytics → Manage Products → Manage Categories → Monitor Orders
```

### Session Flow

```
User Active → 14 min idle → Warning Dialog (60s countdown) → Auto Logout
                                    ↓
                            "Stay Logged In" → Timer Reset
```

---

## Performance Optimizations

- **Lazy-loaded routes** — Feature modules loaded on demand
- **Infinite scroll pagination** — Products fetched 5 at a time as the user scrolls
- **Debounced search** — 400ms delay prevents excessive API calls during typing
- **Throttled activity events** — Idle detection events throttled to 1000ms intervals
- **Computed signals** — Derived state recalculated only when dependencies change
- **Component-scoped SCSS** — Styles isolated per component to prevent bloat

---

## Future Improvements

- Token refresh mechanism for seamless session renewal
- Server-side cart persistence for cross-device access
- Wishlist functionality
- Product reviews and ratings
- Payment gateway integration (Stripe, PayPal)
- Unit and E2E test coverage
- PWA support for offline access

---

*Built with Angular 21 | TypeScript 5.9 | PrimeNG 21 | Chart.js*
