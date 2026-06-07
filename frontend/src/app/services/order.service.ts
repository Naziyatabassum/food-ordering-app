import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private api = 'http://localhost:9090/api/orders';
  constructor(private http: HttpClient) {}

  placeOrder(userId: number, items: any[], deliveryAddress: string): Observable<any> {
    return this.http.post(this.api, { userId, items, deliveryAddress });
  }
  getUserOrders(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/user/${userId}`);
  }
  getAllOrders(): Observable<any[]> { return this.http.get<any[]>(this.api); }
  updateStatus(orderId: number, status: string): Observable<any> {
    return this.http.put(`${this.api}/${orderId}/status?status=${status}`, {});
  }
  markReviewed(orderId: number): Observable<any> {
    return this.http.put(`${this.api}/${orderId}/reviewed`, {});
  }
}
