import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './quick-actions.component.html',
  styleUrl: './quick-actions.component.css'
})
export class QuickActionsComponent {
  actions = [
    {
      label: 'Send Money',
      icon: 'send',
      route: '/transactions/send',
      color: 'primary'
    },
    {
      label: 'Add Beneficiary',
      icon: 'person_add',
      route: '/beneficiaries',
      color: 'accent'
    },
    {
      label: 'Schedule Transfer',
      icon: 'schedule',
      route: '/transactions/scheduled',
      color: 'warn'
    },
    {
      label: 'View Analytics',
      icon: 'analytics',
      route: '/analytics',
      color: 'info'
    }
  ];
}
