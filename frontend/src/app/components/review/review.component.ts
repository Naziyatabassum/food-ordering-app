import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-review', standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review.component.html', styleUrl: './review.component.css'
})
export class ReviewComponent implements OnInit {
  order: any = null;
  reviews: { [key: number]: { comment: string; rating: number } } = {};
  submitted = false;

  constructor(private route: ActivatedRoute, private orderService: OrderService, private reviewService: ReviewService, private auth: AuthService, private router: Router) {}

  ngOnInit() {
    const orderId = +this.route.snapshot.paramMap.get('orderId')!;
    this.orderService.getAllOrders().subscribe(orders => {
      this.order = orders.find((o: any) => o.id === orderId);
      if (this.order) {
        this.order.items.forEach((item: any) => {
          this.reviews[item.product.id] = { comment: '', rating: 5 };
        });
      }
    });
  }

  setRating(productId: number, rating: number) { this.reviews[productId].rating = rating; }

  submitReviews() {
    const user = this.auth.getUser();
    const keys = Object.keys(this.reviews);
    let completed = 0;
    keys.forEach(pid => {
      const r = this.reviews[+pid];
      this.reviewService.addReview({ productId: +pid, userId: user.id, comment: r.comment, rating: r.rating }).subscribe(() => {
        completed++;
        if (completed === keys.length) {
          this.orderService.markReviewed(this.order.id).subscribe(() => {
            this.submitted = true;
            setTimeout(() => this.router.navigate(['/home']), 2000);
          });
        }
      });
    });
  }
}
