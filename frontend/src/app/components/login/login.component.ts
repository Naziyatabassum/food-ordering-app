import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login', standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html', styleUrl: './login.component.css'
})
export class LoginComponent {
  email = ''; password = ''; error = ''; isAdmin = false;
  constructor(private auth: AuthService, private router: Router) {
    // If already logged in, redirect to home/admin
    const user = this.auth.getUser();
    if (user) {
      this.router.navigate([user.role === 'ADMIN' ? '/admin' : '/home'], { replaceUrl: true });
    }
  }

  login() {
    this.auth.login(this.email, this.password).subscribe({
      next: (user: any) => {
        if (this.isAdmin && user.role !== 'ADMIN') { this.error = 'Not an admin account'; return; }
        if (!this.isAdmin && user.role === 'ADMIN') { this.error = 'Please use admin login'; return; }
        this.auth.setUser(user);
        this.router.navigate([user.role === 'ADMIN' ? '/admin' : '/home'], { replaceUrl: true });
      },
      error: () => this.error = 'Invalid email or password'
    });
  }
}
