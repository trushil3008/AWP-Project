import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { guestGuard } from './core/guards/guest.guard';

import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';

export const routes: Routes = [
  // Public routes (guest only)
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // Protected routes (authenticated users)
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: () => {
          const authService = inject(AuthService);
          return authService.isAdmin() ? '/admin' : '/dashboard';
        }
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'account',
        loadChildren: () => import('./account/account.routes').then(m => m.ACCOUNT_ROUTES)
      },
      {
        path: 'transactions',
        loadChildren: () => import('./transactions/transactions.routes').then(m => m.TRANSACTION_ROUTES)
      },
      {
        path: 'beneficiaries',
        loadChildren: () => import('./beneficiaries/beneficiaries.routes').then(m => m.BENEFICIARY_ROUTES)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./analytics/components/analytics-dashboard/analytics-dashboard.component').then(m => m.AnalyticsDashboardComponent)
      },
      // Admin routes
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
      }
    ]
  },

  // Fallback
  {
    path: '**',
    redirectTo: () => {
      const authService = inject(AuthService);
      return authService.isAdmin() ? '/admin' : '/dashboard';
    }
  }
];
