import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar', standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html', styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  constructor(public auth: AuthService, public cart: CartService, private router: Router) {}
  logout() { this.auth.logout(); this.router.navigate(['/login']); }
}
