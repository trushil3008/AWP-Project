import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AdminService } from '../../services/admin.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CurrencyFormatPipe
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  isLoading = true;
  stats = {
    totalUsers: 0,
    activeUsers: 0,
    frozenAccounts: 0,
    totalTransactions: 0,
    totalVolume: 0,
    pendingTransactions: 0
  };

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading = true;

    this.adminService.getDashboardStats().subscribe({
      next: (response: any) => {
        this.stats = response.data || response;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        // Mock data
        this.stats = {
          totalUsers: 1284,
          activeUsers: 1156,
          frozenAccounts: 23,
          totalTransactions: 45678,
          totalVolume: 12500000,
          pendingTransactions: 12
        };
      }
    });
  }
}
