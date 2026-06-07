import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-user-home', standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-home.component.html', styleUrl: './user-home.component.css'
})
export class UserHomeComponent implements OnInit {
  user: any; recentOrders: any[] = []; pendingReviews: any[] = [];
  allOrders: any[] = [];
  constructor(private auth: AuthService, private orderService: OrderService, private router: Router) {}

  ngOnInit() {
    this.user = this.auth.getUser();
    if (!this.user) { this.router.navigate(['/login']); return; }
    this.orderService.getUserOrders(this.user.id).subscribe(orders => {
      const myOrders = orders.filter((o: any) => o.user && o.user.id === this.user.id);
      // Assign user-relative order numbers (oldest = 1)
      const sorted = [...myOrders].reverse();
      sorted.forEach((o: any, i: number) => o.userOrderNum = i + 1);
      this.allOrders = myOrders; // newest first
      this.recentOrders = myOrders.slice(0, 3);
      this.pendingReviews = myOrders.filter((o: any) => o.status === 'DELIVERED' && !o.reviewed);
    });
  }
}
