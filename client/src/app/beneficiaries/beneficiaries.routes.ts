import { Routes } from '@angular/router';

export const BENEFICIARY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/beneficiary-list/beneficiary-list.component').then(m => m.BeneficiaryListComponent)
  }
];
