import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';

import { DashboardService } from '../../services/dashboard.service';
import { AnalyticsService } from '../../../analytics/services/analytics.service';
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
  monthlyStats = {
    income: 0,
    expense: 0,
    incomeChange: null as number | null,
    expenseChange: null as number | null
  };

  constructor(
    private dashboardService: DashboardService,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;

    forkJoin({
      dashboard: this.dashboardService.loadDashboardData(),
      monthly: this.analyticsService.getMonthlyAnalytics(new Date().getFullYear())
    }).subscribe({
      next: ({ dashboard, monthly }: any) => {
        this.account = dashboard.account?.data || dashboard.account || null;
        const txPayload = dashboard.transactions?.data || dashboard.transactions || {};
        this.recentTransactions = txPayload?.transactions || txPayload || [];
        this.applyMonthlyStats(monthly);
        this.isLoading = false;
      },
      error: () => {
        this.account = null;
        this.recentTransactions = [];
        this.monthlyStats = {
          income: 0,
          expense: 0,
          incomeChange: null,
          expenseChange: null
        };
        this.isLoading = false;
      }
    });
  }

  private applyMonthlyStats(monthlyData: any) {
    const credits = monthlyData?.credits || [];
    const debits = monthlyData?.debits || [];
    const currentIndex = new Date().getMonth();
    const prevIndex = currentIndex - 1;

    const income = credits[currentIndex] || 0;
    const expense = debits[currentIndex] || 0;
    const prevIncome = prevIndex >= 0 ? (credits[prevIndex] || 0) : null;
    const prevExpense = prevIndex >= 0 ? (debits[prevIndex] || 0) : null;

    this.monthlyStats = {
      income,
      expense,
      incomeChange: this.calculateChangePercentage(income, prevIncome),
      expenseChange: this.calculateChangePercentage(expense, prevExpense)
    };
  }

  private calculateChangePercentage(current: number, previous: number | null) {
    if (previous === null || previous === undefined) return null;
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
  }
}
