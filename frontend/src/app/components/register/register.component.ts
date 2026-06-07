import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register', standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html', styleUrl: './register.component.css'
})
export class RegisterComponent {
  user = { name: '', email: '', password: '', phone: '', address: '' };
  error = ''; success = '';
  phoneError = ''; passwordError = ''; addressError = ''; emailError = '';
  constructor(private auth: AuthService, private router: Router) {}

  validateEmail(): boolean {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!this.user.email) { this.emailError = 'Email is required'; return false; }
    if (!pattern.test(this.user.email)) { this.emailError = 'Enter a valid email address'; return false; }
    this.emailError = ''; return true;
  }

  validatePhone(): boolean {
    const pattern = /^[6-9]\d{9}$/;
    if (!this.user.phone) { this.phoneError = 'Phone number is required'; return false; }
    if (!pattern.test(this.user.phone)) { this.phoneError = 'Enter a valid 10-digit Indian phone number'; return false; }
    this.phoneError = ''; return true;
  }

  validatePassword(): boolean {
    if (!this.user.password) { this.passwordError = 'Password is required'; return false; }
    if (this.user.password.length < 6) { this.passwordError = 'Password must be at least 6 characters'; return false; }
    if (!/[A-Z]/.test(this.user.password)) { this.passwordError = 'Password must contain at least one uppercase letter'; return false; }
    if (!/[0-9]/.test(this.user.password)) { this.passwordError = 'Password must contain at least one number'; return false; }
    this.passwordError = ''; return true;
  }

  validateAddress(): boolean {
    if (!this.user.address || this.user.address.trim().length < 10) { this.addressError = 'Please enter a valid address (at least 10 characters)'; return false; }
    this.addressError = ''; return true;
  }

  register() {
    this.error = '';
    const emailOk = this.validateEmail();
    const phoneOk = this.validatePhone();
    const passOk = this.validatePassword();
    const addrOk = this.validateAddress();
    if (!emailOk || !phoneOk || !passOk || !addrOk) return;
    this.auth.register(this.user).subscribe({
      next: () => { this.success = 'Registration successful! Redirecting...'; setTimeout(() => this.router.navigate(['/login']), 1500); },
      error: (err: any) => this.error = err.error?.message || 'Registration failed'
    });
  }
}
