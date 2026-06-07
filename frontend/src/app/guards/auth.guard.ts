import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.getUser()) return true;
  router.navigate(['/login'], { replaceUrl: true });
  return false;
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.getUser();
  if (user && user.role === 'ADMIN') return true;
  if (user) router.navigate(['/home'], { replaceUrl: true });
  else router.navigate(['/login'], { replaceUrl: true });
  return false;
};

export const userGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.getUser();
  if (user && user.role === 'USER') return true;
  if (user) router.navigate(['/admin'], { replaceUrl: true });
  else router.navigate(['/login'], { replaceUrl: true });
  return false;
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.getUser();
  if (!user) return true;
  if (user.role === 'ADMIN') { router.navigate(['/admin'], { replaceUrl: true }); return false; }
  router.navigate(['/home'], { replaceUrl: true });
  return false;
};
