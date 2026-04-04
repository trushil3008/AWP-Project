import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AccountNumberPipe } from '../../../shared/pipes/account-number.pipe';

@Component({
  selector: 'app-account-summary',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    AccountNumberPipe
  ],
  templateUrl: './account-summary.component.html',
  styleUrl: './account-summary.component.css'
})
export class AccountSummaryComponent {
  @Input() account = null;
  showBalance = true;

  toggleBalanceVisibility() {
    this.showBalance = !this.showBalance;
  }

  getStatusClass() {
    if (!this.account?.status) return '';
    return this.account.status.toLowerCase();
  }
}
