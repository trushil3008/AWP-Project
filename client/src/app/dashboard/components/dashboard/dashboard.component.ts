import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { DashboardService } from '../../services/dashboard.service';
import { AccountSummaryComponent } from '../account-summary/account-summary.component';
import { RecentTransactionsComponent } from '../recent-transactions/recent-transactions.component';
import { QuickActionsComponent } from '../quick-actions/quick-actions.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    AccountSummaryComponent,
    RecentTransactionsComponent,
    QuickActionsComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  account = null;
  recentTransactions = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;
    
    this.dashboardService.loadDashboardData().subscribe({
      next: (data: any) => {
        this.account = data.account?.data || data.account;
        this.recentTransactions = data.transactions?.data?.transactions || data.transactions?.data || data.transactions || [];
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        // Use mock data for demo purposes
        this.loadMockData();
      }
    });
  }

  loadMockData() {
    // Mock data for demonstration when API is not available
    this.account = {
      accountNumber: '1234567890123456',
      accountType: 'Savings',
      balance: 25480.50,
      status: 'active',
      currency: 'USD'
    };

    this.recentTransactions = [
      {
        id: 1,
        type: 'credit',
        amount: 5000,
        description: 'Salary Deposit',
        date: new Date().toISOString(),
        status: 'completed'
      },
      {
        id: 2,
        type: 'debit',
        amount: 150.75,
        description: 'Electricity Bill',
        date: new Date(Date.now() - 86400000).toISOString(),
        status: 'completed'
      },
      {
        id: 3,
        type: 'debit',
        amount: 89.99,
        description: 'Online Shopping',
        date: new Date(Date.now() - 172800000).toISOString(),
        status: 'completed'
      },
      {
        id: 4,
        type: 'credit',
        amount: 200,
        description: 'Transfer from John',
        date: new Date(Date.now() - 259200000).toISOString(),
        status: 'completed'
      },
      {
        id: 5,
        type: 'debit',
        amount: 45.50,
        description: 'Restaurant',
        date: new Date(Date.now() - 345600000).toISOString(),
        status: 'completed'
      }
    ];
  }
}
