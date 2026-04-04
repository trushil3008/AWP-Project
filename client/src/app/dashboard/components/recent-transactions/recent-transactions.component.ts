import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-recent-transactions',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    CurrencyFormatPipe,
    DateFormatPipe
  ],
  templateUrl: './recent-transactions.component.html',
  styleUrl: './recent-transactions.component.css'
})
export class RecentTransactionsComponent {
  @Input() transactions = [];

  getTransactionIcon(type) {
    return type === 'credit' ? 'arrow_downward' : 'arrow_upward';
  }

  getAmountPrefix(type) {
    return type === 'credit' ? '+' : '-';
  }
}
