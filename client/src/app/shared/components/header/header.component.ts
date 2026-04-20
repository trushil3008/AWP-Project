import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { AuthService } from '../../../core/services/auth.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  isMobileNavOpen = false;

  navItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', exact: true },
    { label: 'My Account', icon: 'account_balance', route: '/account', exact: false },
    { label: 'Send Money', icon: 'send', route: '/transactions/send', exact: true },
    { label: 'History', icon: 'history', route: '/transactions/history', exact: true },
    { label: 'Scheduled', icon: 'schedule', route: '/transactions/scheduled', exact: true },
    { label: 'Beneficiaries', icon: 'people', route: '/beneficiaries', exact: false },
    { label: 'Analytics', icon: 'bar_chart', route: '/analytics', exact: true }
  ];

  adminNavItems = [
    { label: 'Admin', icon: 'admin_panel_settings', route: '/admin', exact: true },
    { label: 'Users', icon: 'manage_accounts', route: '/admin/users', exact: true },
    { label: 'All Txns', icon: 'receipt_long', route: '/admin/transactions', exact: true }
  ];

  constructor(
    public authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  toggleMobileNav() {
    this.isMobileNavOpen = !this.isMobileNavOpen;
  }

  closeMobileNav() {
    this.isMobileNavOpen = false;
  }

  onNavClick(route: string) {
    this.router.navigateByUrl(route);
    this.closeMobileNav();
  }

  isActive(route: string, exact: boolean) {
    return exact ? this.router.url === route : this.router.url.startsWith(route);
  }

  confirmLogout() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Logout',
        message: 'Are you sure you want to logout?',
        type: 'warning',
        confirmText: 'Logout',
        cancelText: 'Stay Logged In'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.closeMobileNav();
        this.authService.logout().subscribe();
      }
    });
  }

  getInitials(name) {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }
}
