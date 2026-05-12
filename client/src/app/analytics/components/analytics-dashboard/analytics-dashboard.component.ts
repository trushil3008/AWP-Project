import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

import { AnalyticsService } from '../../services/analytics.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    BaseChartDirective,
    CurrencyFormatPipe
  ],
  templateUrl: './analytics-dashboard.component.html',
  styleUrl: './analytics-dashboard.component.css'
})
export class AnalyticsDashboardComponent implements OnInit {
  isLoading = true;
  selectedYear = new Date().getFullYear();
  years = [];

  // Summary data
  summary = {
    totalCredit: 0,
    totalDebit: 0,
    netBalance: 0,
    transactionCount: 0,
    averageTransaction: 0
  };

  // Bar Chart - Monthly Transactions
  barChartType = 'bar';
  barChartData = {
    labels: [],
    datasets: []
  };
  barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ₹' + context.raw.toLocaleString();
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        }
      }
    }
  };

  // Doughnut Chart - Credit vs Debit
  doughnutChartType = 'doughnut';
  doughnutChartData = {
    labels: ['Credit', 'Debit'],
    datasets: []
  };
  doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return context.label + ': ₹' + context.raw.toLocaleString() + ' (' + percentage + '%)';
          }
        }
      }
    },
    cutout: '65%'
  };

  // Line Chart - Trend
  lineChartType = 'line';
  lineChartData = {
    labels: [],
    datasets: []
  };
  lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.4
      }
    }
  };

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit() {
    this.initYears();
    this.loadAnalytics();
  }

  initYears() {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 4; i--) {
      this.years.push(i);
    }
  }

  loadAnalytics() {
    this.isLoading = true;

    this.analyticsService.getMonthlyAnalytics(this.selectedYear).subscribe({
      next: (data: any) => {
        this.processData(data);
        this.isLoading = false;
      },
      error: () => {
        this.barChartData = { labels: [], datasets: [] };
        this.doughnutChartData = { labels: ['Income', 'Expenses'], datasets: [] };
        this.lineChartData = { labels: [], datasets: [] };
        this.summary = {
          totalCredit: 0,
          totalDebit: 0,
          netBalance: 0,
          transactionCount: 0,
          averageTransaction: 0
        };
        this.isLoading = false;
      }
    });
  }

  processData(data: any) {
    const labels = data?.labels || [];
    const credits = data?.credits || [];
    const debits = data?.debits || [];
    const creditCount = data?.creditCount || 0;
    const debitCount = data?.debitCount || 0;

    // Bar Chart Data
    this.barChartData = {
      labels,
      datasets: [
        {
          label: 'Income',
          data: credits,
          backgroundColor: 'rgba(76, 175, 80, 0.8)',
          borderColor: 'rgba(76, 175, 80, 1)',
          borderWidth: 1,
          borderRadius: 4
        },
        {
          label: 'Expenses',
          data: debits,
          backgroundColor: 'rgba(244, 67, 54, 0.8)',
          borderColor: 'rgba(244, 67, 54, 1)',
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    };

    // Doughnut Chart Data
  const totalCredit = credits.reduce((a, b) => a + b, 0);
  const totalDebit = debits.reduce((a, b) => a + b, 0);

    this.doughnutChartData = {
      labels: ['Income', 'Expenses'],
      datasets: [
        {
          data: [totalCredit, totalDebit],
          backgroundColor: [
            'rgba(76, 175, 80, 0.9)',
            'rgba(244, 67, 54, 0.9)'
          ],
          borderColor: [
            'rgba(76, 175, 80, 1)',
            'rgba(244, 67, 54, 1)'
          ],
          borderWidth: 2
        }
      ]
    };

    // Line Chart Data - Net Balance Trend
    const netBalances = credits.map((credit, i) => credit - (debits[i] || 0));
    this.lineChartData = {
      labels,
      datasets: [
        {
          label: 'Net Balance',
          data: netBalances,
          fill: true,
          backgroundColor: 'rgba(26, 35, 126, 0.1)',
          borderColor: 'rgba(26, 35, 126, 1)',
          pointBackgroundColor: 'rgba(26, 35, 126, 1)',
          pointBorderColor: '#fff',
          pointRadius: 4
        }
      ]
    };

    // Update summary
    const transactionCount = creditCount + debitCount;
    this.summary = {
      totalCredit,
      totalDebit,
      netBalance: totalCredit - totalDebit,
      transactionCount,
      averageTransaction: transactionCount > 0 ? (totalCredit + totalDebit) / transactionCount : 0
    };
  }

  onYearChange(year) {
    this.selectedYear = year;
    this.loadAnalytics();
  }
}
