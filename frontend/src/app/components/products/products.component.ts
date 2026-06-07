import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { ReviewService } from '../../services/review.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-products', standalone: true,
  imports: [CommonModule],
  templateUrl: './products.component.html', styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  products: any[] = []; category = ''; sortOrder = 'asc';
  addedId: number | null = null;
  productRatings: { [id: number]: { avg: number; count: number } } = {};

  constructor(private productService: ProductService, public cartService: CartService, private reviewService: ReviewService, private router: Router) {}
  ngOnInit() { this.loadProducts(); }

  loadProducts() {
    this.productService.getProducts(this.category || undefined, this.sortOrder).subscribe(p => {
      this.products = p;
      p.forEach((prod: any) => {
        this.reviewService.getProductReviews(prod.id).subscribe(reviews => {
          const avg = reviews.length ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length : 0;
          this.productRatings[prod.id] = { avg, count: reviews.length };
        });
      });
    });
  }
  filterCategory(cat: string) { this.category = cat; this.loadProducts(); }
  changeSort(order: string) { this.sortOrder = order; this.loadProducts(); }
  addToCart(product: any, event: Event) {
    event.stopPropagation();
    this.cartService.addToCart(product);
    this.addedId = product.id;
    setTimeout(() => this.addedId = null, 1200);
  }
  getStars(rating: number): string {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  }
  goToCart(event: Event) { event.stopPropagation(); this.router.navigate(['/cart']); }
  viewProduct(id: number) { this.router.navigate(['/product', id]); }
}
