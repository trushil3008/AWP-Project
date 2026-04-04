import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('./components/user-management/user-management.component').then(m => m.UserManagementComponent)
  },
  {
    path: 'transactions',
    loadComponent: () => import('./components/transaction-monitoring/transaction-monitoring.component').then(m => m.TransactionMonitoringComponent)
  }
];
