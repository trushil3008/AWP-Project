import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard to prevent authenticated users from accessing guest routes (login/register)
 */
export const guestGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth check to complete
  if (authService.isLoading()) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!authService.isLoading()) {
          clearInterval(checkInterval);
          if (!authService.isAuthenticated()) {
            resolve(true);
          } else {
            router.navigate(['/dashboard']);
            resolve(false);
          }
        }
      }, 50);
    });
  }

  if (!authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
