import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AccountService } from '../../services/account.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { AccountNumberPipe } from '../../../shared/pipes/account-number.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-account-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    CurrencyFormatPipe,
    AccountNumberPipe,
    DateFormatPipe
  ],
  templateUrl: './account-details.component.html',
  styleUrl: './account-details.component.css'
})
export class AccountDetailsComponent implements OnInit {
  account = null;
  isLoading = true;
  showAccountNumber = false;

  constructor(private accountService: AccountService) {}

  ngOnInit() {
    this.loadAccount();
  }

  loadAccount() {
    this.isLoading = true;
    
    this.accountService.getAccount().subscribe({
      next: (response: any) => {
        this.account = response.data || response;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        // Load mock data for demo
        this.loadMockData();
      }
    });
  }

  loadMockData() {
    this.account = {
      accountNumber: '1234567890123456',
      accountType: 'Savings',
      balance: 25480.50,
      availableBalance: 25480.50,
      status: 'active',
      currency: 'USD',
      openedDate: '2023-01-15',
      lastTransactionDate: new Date().toISOString(),
      interestRate: 2.5,
      branch: 'Main Branch',
      ifscCode: 'SBNK0001234'
    };
  }

  toggleAccountNumber() {
    this.showAccountNumber = !this.showAccountNumber;
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text);
  }

  getStatusClass() {
    if (!this.account?.status) return '';
    return this.account.status.toLowerCase();
  }
}
