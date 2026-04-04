import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { AdminService } from '../../services/admin.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-transaction-monitoring',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    CurrencyFormatPipe,
    DateFormatPipe
  ],
  templateUrl: './transaction-monitoring.component.html',
  styleUrl: './transaction-monitoring.component.css'
})
export class TransactionMonitoringComponent implements OnInit {
  @ViewChild(MatPaginator) paginator;
  @ViewChild(MatSort) sort;

  filterForm;
  dataSource;
  displayedColumns = ['id', 'sender', 'receiver', 'amount', 'type', 'status', 'createdAt'];
  isLoading = true;

  typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'transfer', label: 'Transfer' },
    { value: 'deposit', label: 'Deposit' },
    { value: 'withdrawal', label: 'Withdrawal' }
  ];

  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' }
  ];

  summary = {
    totalTransactions: 0,
    totalVolume: 0,
    completedCount: 0,
    pendingCount: 0
  };

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService
  ) {
    this.dataSource = new MatTableDataSource([]);
  }

  ngOnInit() {
    this.initFilterForm();
    this.loadTransactions();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  initFilterForm() {
    this.filterForm = this.fb.group({
      search: [''],
      type: [''],
      status: [''],
      startDate: [null],
      endDate: [null]
    });
  }

  loadTransactions() {
    this.isLoading = true;

    var params = { ...this.filterForm.value };
    if (params.startDate) {
      params.startDate = params.startDate.toISOString();
    }
    if (params.endDate) {
      params.endDate = params.endDate.toISOString();
    }

    this.adminService.getAllTransactions(params).subscribe({
      next: (response: any) => {
        var transactions = response || [];
        this.dataSource.data = transactions;
        this.calculateSummary(transactions);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.loadMockData();
      }
    });
  }

  loadMockData() {
    var transactions = [
      { id: 'TXN001', senderName: 'John Doe', senderAccount: '1234567890', receiverName: 'Jane Smith', receiverAccount: '0987654321', amount: 5000, type: 'transfer', status: 'completed', createdAt: '2024-01-15T10:30:00Z' },
      { id: 'TXN002', senderName: 'Bob Wilson', senderAccount: '5555666677', receiverName: 'Alice Brown', receiverAccount: '1111222233', amount: 1250.50, type: 'transfer', status: 'completed', createdAt: '2024-01-15T09:15:00Z' },
      { id: 'TXN003', senderName: 'System', senderAccount: 'SYSTEM', receiverName: 'Charlie Davis', receiverAccount: '9999888877', amount: 10000, type: 'deposit', status: 'completed', createdAt: '2024-01-14T16:45:00Z' },
      { id: 'TXN004', senderName: 'Alice Brown', senderAccount: '1111222233', receiverName: 'External', receiverAccount: 'EXT12345', amount: 2500, type: 'withdrawal', status: 'pending', createdAt: '2024-01-14T14:20:00Z' },
      { id: 'TXN005', senderName: 'Jane Smith', senderAccount: '0987654321', receiverName: 'Bob Wilson', receiverAccount: '5555666677', amount: 750, type: 'transfer', status: 'failed', createdAt: '2024-01-14T11:00:00Z' },
      { id: 'TXN006', senderName: 'Charlie Davis', senderAccount: '9999888877', receiverName: 'John Doe', receiverAccount: '1234567890', amount: 3200, type: 'transfer', status: 'completed', createdAt: '2024-01-13T15:30:00Z' },
      { id: 'TXN007', senderName: 'System', senderAccount: 'SYSTEM', receiverName: 'Jane Smith', receiverAccount: '0987654321', amount: 500, type: 'deposit', status: 'completed', createdAt: '2024-01-13T10:00:00Z' },
      { id: 'TXN008', senderName: 'John Doe', senderAccount: '1234567890', receiverName: 'External', receiverAccount: 'EXT67890', amount: 8000, type: 'withdrawal', status: 'pending', createdAt: '2024-01-12T17:45:00Z' }
    ];
    this.dataSource.data = transactions;
    this.calculateSummary(transactions);
  }

  calculateSummary(transactions) {
    this.summary.totalTransactions = transactions.length;
    this.summary.totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
    this.summary.completedCount = transactions.filter(t => t.status === 'completed').length;
    this.summary.pendingCount = transactions.filter(t => t.status === 'pending').length;
  }

  applySearch(event) {
    var filterValue = event.target.value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  applyFilters() {
    this.loadTransactions();
  }

  resetFilters() {
    this.filterForm.reset({
      search: '',
      type: '',
      status: '',
      startDate: null,
      endDate: null
    });
    this.loadTransactions();
  }

  getTypeIcon(type) {
    switch (type) {
      case 'transfer': return 'swap_horiz';
      case 'deposit': return 'arrow_downward';
      case 'withdrawal': return 'arrow_upward';
      default: return 'receipt';
    }
  }
}
