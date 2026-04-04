import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;
  
  private accountSubject = new BehaviorSubject(null);
  private recentTransactionsSubject = new BehaviorSubject([]);
  
  account$ = this.accountSubject.asObservable();
  recentTransactions$ = this.recentTransactionsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Load all dashboard data in parallel
   */
  loadDashboardData() {
    return forkJoin({
      account: this.http.get(`${this.apiUrl}/account`, { withCredentials: true }),
      transactions: this.http.get(`${this.apiUrl}/transactions?limit=5`, { withCredentials: true })
    }).pipe(
      tap((response: any) => {
        this.accountSubject.next(response.account?.data || response.account);
        const recentTransactions = response.transactions?.data?.transactions || response.transactions?.data || response.transactions || [];
        this.recentTransactionsSubject.next(recentTransactions);
      })
    );
  }

  /**
   * Get account summary
   */
  getAccountSummary() {
    return this.http.get(`${this.apiUrl}/account`, { withCredentials: true }).pipe(
      tap((response: any) => {
        this.accountSubject.next(response.data || response);
      })
    );
  }

  /**
   * Get recent transactions
   */
  getRecentTransactions(limit = 5) {
    return this.http.get(`${this.apiUrl}/transactions?limit=${limit}`, { withCredentials: true }).pipe(
      tap((response: any) => {
        const recentTransactions = response?.data?.transactions || response?.data || response || [];
        this.recentTransactionsSubject.next(recentTransactions);
      })
    );
  }

  /**
   * Get current account data
   */
  getCurrentAccount() {
    return this.accountSubject.value;
  }
}
