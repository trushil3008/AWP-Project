import { Routes } from '@angular/router';

export const TRANSACTION_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'history',
    pathMatch: 'full'
  },
  {
    path: 'send',
    loadComponent: () => import('./components/send-money/send-money.component').then(m => m.SendMoneyComponent)
  },
  {
    path: 'history',
    loadComponent: () => import('./components/transaction-history/transaction-history.component').then(m => m.TransactionHistoryComponent)
  },
  {
    path: 'scheduled',
    loadComponent: () => import('./components/schedule-transfer/schedule-transfer.component').then(m => m.ScheduleTransferComponent)
  }
];
