import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = 'https://food-ordering-app-5v8o.onrender.com/api/products';
  constructor(private http: HttpClient) {}

  getProducts(category?: string, sort: string = 'asc'): Observable<any[]> {
    let url = `${this.api}?sort=${sort}`;
    if (category) url += `&category=${category}`;
    return this.http.get<any[]>(url);
  }
  getProduct(id: number): Observable<any> { return this.http.get(`${this.api}/${id}`); }
  addProduct(product: any): Observable<any> { return this.http.post(this.api, product); }
  updateProduct(id: number, product: any): Observable<any> { return this.http.put(`${this.api}/${id}`, product); }
  deleteProduct(id: number): Observable<any> { return this.http.delete(`${this.api}/${id}`); }
}
