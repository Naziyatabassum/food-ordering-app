# Frontend Documentation - Food Ordering Application

## Overview

This is an **Angular 19** standalone component-based food ordering application. It follows a role-based architecture with separate flows for **Users** (customers) and **Admins**.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Angular | 19.2.0 | Frontend framework |
| TypeScript | ~5.7.2 | Language |
| RxJS | ~7.8.0 | Reactive programming |
| Leaflet | - | Map rendering (delivery validation) |
| Zone.js | ~0.15.0 | Change detection |

---

## Project Structure

```
src/app/
├── app.component.ts          # Root component
├── app.config.ts             # Application configuration (providers)
├── app.routes.ts             # Route definitions
├── guards/
│   └── auth.guard.ts         # Route guards (auth, admin, user, guest)
├── interceptors/
│   └── auth.interceptor.ts   # JWT token interceptor
├── services/
│   ├── auth.service.ts       # Authentication & user session
│   ├── cart.service.ts       # In-memory cart management
│   ├── order.service.ts      # Order placement & tracking
│   ├── product.service.ts    # Product CRUD operations
│   └── review.service.ts     # Product reviews
└── components/
    ├── login/                # Login page
    ├── register/             # Registration page
    ├── navbar/               # Navigation bar
    ├── user-home/            # User dashboard
    ├── products/             # Product listing with filters
    ├── product-detail/       # Single product view
    ├── cart/                 # Shopping cart with address validation
    ├── order-tracking/       # Real-time order status tracking
    ├── review/               # Post-delivery review submission
    ├── admin-dashboard/      # Admin home page
    ├── admin-products/       # Admin product management (CRUD)
    ├── admin-orders/         # Admin order management
    └── admin-users/          # Admin user management
```

---

## Application Configuration (`app.config.ts`)

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
```

**Key Points for Interview:**
- Uses `provideHttpClient` with functional interceptors (new Angular 15+ pattern)
- `eventCoalescing: true` optimizes change detection by batching multiple events
- Standalone application (no NgModules)

---

## Routing (`app.routes.ts`)

The app has **13 routes** organized into 3 groups:

### Guest Routes (unauthenticated only)
| Path | Component | Guard |
|---|---|---|
| `/login` | LoginComponent | `guestGuard` |
| `/register` | RegisterComponent | `guestGuard` |

### User Routes (USER role only)
| Path | Component | Guard |
|---|---|---|
| `/home` | UserHomeComponent | `userGuard` |
| `/products` | ProductsComponent | `userGuard` |
| `/product/:id` | ProductDetailComponent | `userGuard` |
| `/cart` | CartComponent | `userGuard` |
| `/order-tracking/:orderId` | OrderTrackingComponent | `userGuard` |
| `/review/:orderId` | ReviewComponent | `userGuard` |

### Admin Routes (ADMIN role only)
| Path | Component | Guard |
|---|---|---|
| `/admin` | AdminDashboardComponent | `adminGuard` |
| `/admin/products` | AdminProductsComponent | `adminGuard` |
| `/admin/orders` | AdminOrdersComponent | `adminGuard` |
| `/admin/users` | AdminUsersComponent | `adminGuard` |

---

## Route Guards (`guards/auth.guard.ts`)

We use **functional route guards** (Angular 15+ `CanActivateFn` pattern):

### 1. `authGuard`
- Allows any authenticated user
- Redirects to `/login` if not logged in

### 2. `adminGuard`
- Allows only users with `role === 'ADMIN'`
- Redirects USER to `/home`, guests to `/login`

### 3. `userGuard`
- Allows only users with `role === 'USER'`
- Redirects ADMIN to `/admin`, guests to `/login`

### 4. `guestGuard`
- Allows only unauthenticated users (not logged in)
- Redirects ADMIN to `/admin`, USER to `/home`
- **Purpose:** Prevents logged-in users from accessing login/register pages

**Interview Explanation:**
> "We use functional guards with Angular's `inject()` function to access services. This is the modern approach replacing class-based guards which are now deprecated. Each guard checks the user's role from localStorage and redirects accordingly using `replaceUrl: true` to prevent back-button issues."

---

## HTTP Interceptor (`interceptors/auth.interceptor.ts`)

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const userData = localStorage.getItem('user');
  if (userData) {
    const user = JSON.parse(userData);
    if (user.token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${user.token}` }
      });
    }
  }
  return next(req);
};
```

**Interview Explanation:**
> "This is a functional HTTP interceptor that automatically attaches the JWT token to every outgoing HTTP request. It reads the token from localStorage, clones the request (since requests are immutable), and adds the `Authorization: Bearer <token>` header. This ensures all API calls are authenticated without manually adding headers in every service."

---

## Services

### AuthService (`services/auth.service.ts`)

| Method | Description |
|---|---|
| `login(email, password)` | POST `/api/auth/login` — authenticates user |
| `register(user)` | POST `/api/auth/register` — creates new account |
| `getAllUsers()` | GET `/api/auth/users` — fetches all users (admin) |
| `setUser(user)` | Stores user data in localStorage |
| `getUser()` | Retrieves user from localStorage |
| `isLoggedIn()` | Checks if user exists in localStorage |
| `isAdmin()` | Checks if logged-in user has ADMIN role |
| `logout()` | Removes user from localStorage |

**Interview Explanation:**
> "AuthService manages authentication state using localStorage for persistence across page refreshes. The JWT token received from the backend is stored along with user details. We use `providedIn: 'root'` for singleton behavior — only one instance exists application-wide."

---

### CartService (`services/cart.service.ts`)

An **in-memory** cart service (resets on page refresh):

| Method | Description |
|---|---|
| `addToCart(product)` | Adds product or increments quantity if exists |
| `removeFromCart(productId)` | Removes item from cart |
| `updateQuantity(productId, qty)` | Updates quantity, auto-removes if ≤ 0 |
| `isInCart(productId)` | Checks if product is in cart |
| `getQuantityInCart(productId)` | Gets current quantity for product |
| `getTotal()` | Calculates total price (price × quantity) |
| `getItemCount()` | Returns total number of items |
| `clear()` | Empties the cart |

**Interview Explanation:**
> "CartService uses a simple in-memory array. We chose not to persist cart to backend for simplicity. The `addToCart` method checks for existing items to avoid duplicates — it increments quantity instead. `getTotal()` uses `reduce()` to calculate the sum of all items."

---

### OrderService (`services/order.service.ts`)

| Method | Description |
|---|---|
| `placeOrder(userId, items, address)` | POST — creates a new order |
| `getUserOrders(userId)` | GET — fetches user's order history |
| `getAllOrders()` | GET — fetches all orders (admin) |
| `updateStatus(orderId, status)` | PUT — updates order status (admin) |
| `markReviewed(orderId)` | PUT — marks order as reviewed |

---

### ProductService (`services/product.service.ts`)

| Method | Description |
|---|---|
| `getProducts(category?, sort)` | GET with optional filter & sort params |
| `getProduct(id)` | GET single product by ID |
| `addProduct(product)` | POST — create new product (admin) |
| `updateProduct(id, product)` | PUT — update product (admin) |
| `deleteProduct(id)` | DELETE — remove product (admin) |

---

### ReviewService (`services/review.service.ts`)

| Method | Description |
|---|---|
| `addReview(review)` | POST — submit a product review |
| `getProductReviews(productId)` | GET — fetch all reviews for a product |

---

## Key Components

### LoginComponent

- Two-mode login: User or Admin (toggle)
- Validates role match (user trying admin login gets error)
- Redirects already-authenticated users on component creation
- Uses `FormsModule` for template-driven forms

### NavbarComponent

- Displays navigation links based on user role
- Shows cart item count badge for users
- Logout functionality clears session and redirects to `/login`

### ProductsComponent

- Fetches products with category filtering and price sorting
- Displays star ratings by fetching reviews for each product
- "Add to Cart" with 1.2-second visual feedback animation
- Click product card to navigate to detail page

### CartComponent (Most Complex)

**Key Feature: Address Validation with Geocoding**

1. User can choose default address (from profile) or enter custom address
2. Address is geocoded using **Nominatim OpenStreetMap API**
3. Multiple geocoding attempts with fallback strategies:
   - Full address with city suffix
   - Last 2-3 parts of address
   - Pincode lookup
4. **Haversine formula** calculates distance from restaurant (Gandhipuram, Coimbatore)
5. Delivery restricted to **30 km radius**
6. Shows **Leaflet map** with markers and radius circle when address is out of range

**Interview Explanation:**
> "The cart implements a multi-strategy geocoding approach. If the full address doesn't resolve, we try progressively simpler queries — area names, pincode. Once we get coordinates, we use the Haversine formula to calculate the great-circle distance between the restaurant and the delivery location. If it exceeds 30 km, we reject the order and show an interactive map with the delivery radius visualized."

### AdminProductsComponent

- Full CRUD operations for product management
- Inline editing with form pre-population
- Confirmation dialog before deletion
- Success message notifications (auto-dismiss after 3 seconds)

---

## Authentication Flow

```
User opens app → guestGuard checks localStorage
  ├── Not logged in → Show login/register page
  └── Logged in → Redirect to /home or /admin

User logs in → Backend returns { id, email, role, token, address }
  → Stored in localStorage
  → authInterceptor attaches token to all future requests
  → Navigate to role-based dashboard

User accesses protected route → Guard checks role
  ├── Correct role → Allow access
  ├── Wrong role → Redirect to correct dashboard
  └── No user → Redirect to /login
```

---

## API Endpoints (Backend Communication)

All services communicate with the Spring Boot backend at `http://localhost:9090`:

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/login` | POST | User authentication |
| `/api/auth/register` | POST | User registration |
| `/api/auth/users` | GET | List all users |
| `/api/products` | GET/POST | List or create products |
| `/api/products/:id` | GET/PUT/DELETE | Product CRUD |
| `/api/orders` | GET/POST | List or create orders |
| `/api/orders/user/:id` | GET | User's orders |
| `/api/orders/:id/status` | PUT | Update order status |
| `/api/orders/:id/reviewed` | PUT | Mark order reviewed |
| `/api/reviews` | POST | Add review |
| `/api/reviews/product/:id` | GET | Product reviews |

---

## Key Angular Concepts Used

1. **Standalone Components** — No NgModules, each component declares its own imports
2. **Functional Guards** — `CanActivateFn` with `inject()` for DI
3. **Functional Interceptors** — `HttpInterceptorFn` pattern
4. **Reactive Programming** — RxJS Observables for HTTP calls
5. **Template-driven Forms** — `FormsModule` with `[(ngModel)]`
6. **Route Parameters** — `:id`, `:orderId` for dynamic routing
7. **Service Injection** — `providedIn: 'root'` for singleton services
8. **Event Coalescing** — Optimized zone.js change detection

---

## How to Run

```bash
cd frontend
npm install
ng serve --open
```

The app runs on `http://localhost:4200` and connects to the backend at `http://localhost:9090`.

---

## Common Interview Questions & Answers

**Q: Why standalone components instead of NgModules?**
> Standalone components (Angular 14+) reduce boilerplate, improve tree-shaking, and make the component self-contained. Each component explicitly declares what it needs.

**Q: How do you handle authentication?**
> JWT-based auth. Token stored in localStorage, automatically attached via HTTP interceptor. Route guards prevent unauthorized access based on role.

**Q: How does the cart work?**
> In-memory service (singleton). Items are stored in an array with product reference and quantity. The service provides methods for add, remove, update, and calculations.

**Q: How do you validate delivery addresses?**
> We use Nominatim (OpenStreetMap) geocoding API with multiple fallback strategies. Once we get coordinates, we calculate distance using the Haversine formula and restrict delivery to a 30km radius.

**Q: What is the Haversine formula?**
> It calculates the great-circle distance between two points on a sphere using their latitude and longitude. We use it to determine if a delivery address is within our service area.

**Q: How do guards work in Angular?**
> Functional guards return `true` to allow navigation or `false` to block it. They can also redirect using the Router. Angular calls them before activating a route.
