import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private api = 'https://food-ordering-app-5v8o.onrender.com/api/reviews';
  constructor(private http: HttpClient) {}

  addReview(review: any): Observable<any> { return this.http.post(this.api, review); }
  getProductReviews(productId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/product/${productId}`);
  }
}
