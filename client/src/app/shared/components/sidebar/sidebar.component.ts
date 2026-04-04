import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() isCollapsed = false;
  @Output() menuItemClicked = new EventEmitter();

  constructor(public authService: AuthService) {}

  menuItems = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
      exact: true
    },
    {
      label: 'My Account',
      icon: 'account_balance',
      route: '/account',
      exact: false
    },
    {
      label: 'Send Money',
      icon: 'send',
      route: '/transactions/send',
      exact: true
    },
    {
      label: 'Transaction History',
      icon: 'history',
      route: '/transactions/history',
      exact: true
    },
    {
      label: 'Scheduled Transfers',
      icon: 'schedule',
      route: '/transactions/scheduled',
      exact: true
    },
    {
      label: 'Beneficiaries',
      icon: 'people',
      route: '/beneficiaries',
      exact: false
    },
    {
      label: 'Analytics',
      icon: 'bar_chart',
      route: '/analytics',
      exact: true
    }
  ];

  adminMenuItems = [
    {
      label: 'Admin Dashboard',
      icon: 'admin_panel_settings',
      route: '/admin',
      exact: true
    },
    {
      label: 'User Management',
      icon: 'manage_accounts',
      route: '/admin/users',
      exact: true
    },
    {
      label: 'All Transactions',
      icon: 'receipt_long',
      route: '/admin/transactions',
      exact: true
    }
  ];

  onMenuItemClick() {
    this.menuItemClicked.emit();
  }
}
