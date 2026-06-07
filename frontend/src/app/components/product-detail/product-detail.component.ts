import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { ReviewService } from '../../services/review.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-detail', standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html', styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  product: any = null;
  reviews: any[] = [];
  avgRating = 0;
  addedToCart = false;

  constructor(
    private route: ActivatedRoute, private router: Router,
    private productService: ProductService, private reviewService: ReviewService,
    public cartService: CartService
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.productService.getProducts().subscribe(products => {
      this.product = products.find((p: any) => p.id === id);
    });
    this.reviewService.getProductReviews(id).subscribe(r => {
      this.reviews = r;
      this.avgRating = r.length ? r.reduce((sum: number, rv: any) => sum + rv.rating, 0) / r.length : 0;
    });
  }

  getStars(rating: number): string {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  }

  addToCart() {
    this.cartService.addToCart(this.product);
    this.addedToCart = true;
    setTimeout(() => this.addedToCart = false, 1500);
  }

  goToCart() { this.router.navigate(['/cart']); }
  goBack() { this.router.navigate(['/products']); }
}
