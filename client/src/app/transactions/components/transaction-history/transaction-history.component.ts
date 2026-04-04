import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { TransactionService } from '../../services/transaction.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-transaction-history',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    CurrencyFormatPipe,
    DateFormatPipe
  ],
  templateUrl: './transaction-history.component.html',
  styleUrl: './transaction-history.component.css'
})
export class TransactionHistoryComponent implements OnInit {
  @ViewChild(MatPaginator) paginator;
  @ViewChild(MatSort) sort;

  filterForm;
  dataSource;
  displayedColumns = ['date', 'description', 'type', 'amount', 'status'];
  isLoading = true;
  totalRecords = 0;

  transactionTypes = [
    { value: '', label: 'All Types' },
    { value: 'credit', label: 'Credit' },
    { value: 'debit', label: 'Debit' }
  ];

  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' }
  ];

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService
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
      type: [''],
      status: [''],
      startDate: [null],
      endDate: [null],
      search: ['']
    });
  }

  loadTransactions() {
    this.isLoading = true;
    const filters = this.filterForm.value;

    this.transactionService.getTransactions(filters).subscribe({
      next: (response: any) => {
        const data = response?.transactions || response?.data?.transactions || response?.data || response || [];
        this.dataSource.data = data;
        this.totalRecords = data.length;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.loadMockData();
      }
    });
  }

  loadMockData() {
    const mockTransactions = [
      { id: 1, date: new Date().toISOString(), description: 'Salary Deposit', type: 'credit', amount: 5000, status: 'completed' },
      { id: 2, date: new Date(Date.now() - 86400000).toISOString(), description: 'Electricity Bill', type: 'debit', amount: 150.75, status: 'completed' },
      { id: 3, date: new Date(Date.now() - 172800000).toISOString(), description: 'Online Shopping', type: 'debit', amount: 89.99, status: 'completed' },
      { id: 4, date: new Date(Date.now() - 259200000).toISOString(), description: 'Transfer from John', type: 'credit', amount: 200, status: 'completed' },
      { id: 5, date: new Date(Date.now() - 345600000).toISOString(), description: 'Restaurant', type: 'debit', amount: 45.50, status: 'completed' },
      { id: 6, date: new Date(Date.now() - 432000000).toISOString(), description: 'Transfer to Jane', type: 'debit', amount: 300, status: 'completed' },
      { id: 7, date: new Date(Date.now() - 518400000).toISOString(), description: 'Freelance Payment', type: 'credit', amount: 1500, status: 'completed' },
      { id: 8, date: new Date(Date.now() - 604800000).toISOString(), description: 'Internet Bill', type: 'debit', amount: 79.99, status: 'completed' },
      { id: 9, date: new Date(Date.now() - 691200000).toISOString(), description: 'Refund', type: 'credit', amount: 25.00, status: 'completed' },
      { id: 10, date: new Date(Date.now() - 777600000).toISOString(), description: 'Subscription', type: 'debit', amount: 14.99, status: 'pending' }
    ];

    this.dataSource.data = mockTransactions;
    this.totalRecords = mockTransactions.length;
  }

  applyFilters() {
    this.loadTransactions();
  }

  resetFilters() {
    this.filterForm.reset();
    this.loadTransactions();
  }

  applySearch(event) {
    const filterValue = event.target.value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  getAmountClass(type) {
    return type === 'credit' ? 'credit' : 'debit';
  }

  getAmountPrefix(type) {
    return type === 'credit' ? '+' : '-';
  }
}
