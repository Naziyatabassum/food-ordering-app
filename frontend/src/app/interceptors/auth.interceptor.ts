import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const userData = localStorage.getItem('user');
  if (userData) {
    const user = JSON.parse(userData);
    if (user.token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${user.token}` }
      });
    }
  }
  return next(req);
};
