import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { UserHomeComponent } from './components/user-home/user-home.component';
import { ProductsComponent } from './components/products/products.component';
import { CartComponent } from './components/cart/cart.component';
import { OrderTrackingComponent } from './components/order-tracking/order-tracking.component';
import { ReviewComponent } from './components/review/review.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AdminProductsComponent } from './components/admin-products/admin-products.component';
import { AdminOrdersComponent } from './components/admin-orders/admin-orders.component';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { authGuard, adminGuard, userGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  // User routes - only USER role
  { path: 'home', component: UserHomeComponent, canActivate: [userGuard] },
  { path: 'products', component: ProductsComponent, canActivate: [userGuard] },
  { path: 'product/:id', component: ProductDetailComponent, canActivate: [userGuard] },
  { path: 'cart', component: CartComponent, canActivate: [userGuard] },
  { path: 'order-tracking/:orderId', component: OrderTrackingComponent, canActivate: [userGuard] },
  { path: 'review/:orderId', component: ReviewComponent, canActivate: [userGuard] },
  // Admin routes - only ADMIN role
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'admin/products', component: AdminProductsComponent, canActivate: [adminGuard] },
  { path: 'admin/orders', component: AdminOrdersComponent, canActivate: [adminGuard] },
  { path: 'admin/users', component: AdminUsersComponent, canActivate: [adminGuard] },
];
