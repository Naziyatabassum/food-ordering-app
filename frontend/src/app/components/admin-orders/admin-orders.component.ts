import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-admin-orders', standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-orders.component.html', styleUrl: './admin-orders.component.css'
})
export class AdminOrdersComponent implements OnInit {
  orders: any[] = [];
  constructor(private orderService: OrderService) {}
  ngOnInit() { this.orderService.getAllOrders().subscribe(o => this.orders = o); }
}
