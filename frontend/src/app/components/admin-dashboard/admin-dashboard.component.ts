import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-admin-dashboard', standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html', styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  totalUsers = 0; totalProducts = 0; totalOrders = 0; totalRevenue = 0;
  constructor(private auth: AuthService, private productService: ProductService, private orderService: OrderService) {}
  ngOnInit() {
    this.auth.getAllUsers().subscribe(u => this.totalUsers = u.length);
    this.productService.getProducts().subscribe(p => this.totalProducts = p.length);
    this.orderService.getAllOrders().subscribe(o => { this.totalOrders = o.length; this.totalRevenue = o.reduce((s: number, x: any) => s + x.totalAmount, 0); });
  }
}
