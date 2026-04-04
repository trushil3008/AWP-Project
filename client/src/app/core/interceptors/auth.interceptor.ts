import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Auth interceptor to ensure credentials are sent with requests
 * Since we're using HTTP-only cookies, we just need to set withCredentials
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Clone the request and add withCredentials
  const authReq = req.clone({
    withCredentials: true
  });

  return next(authReq);
};
