import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard to protect admin-only routes
 */
export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth check to complete
  if (authService.isLoading()) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!authService.isLoading()) {
          clearInterval(checkInterval);
          if (authService.isAuthenticated() && authService.isAdmin()) {
            resolve(true);
          } else {
            router.navigate(['/dashboard']);
            resolve(false);
          }
        }
      }, 50);
    });
  }

  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
