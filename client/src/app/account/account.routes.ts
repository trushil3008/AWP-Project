import { Routes } from '@angular/router';

export const ACCOUNT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/account-details/account-details.component').then(m => m.AccountDetailsComponent)
  }
];
