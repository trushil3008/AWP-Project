import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = environment.apiUrl;
  
  private monthlyDataSubject = new BehaviorSubject(null);
  private summarySubject = new BehaviorSubject(null);
  
  monthlyData$ = this.monthlyDataSubject.asObservable();
  summary$ = this.summarySubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get monthly transaction analytics
   */
  getMonthlyAnalytics(year = new Date().getFullYear()) {
    return this.http.get(`${this.apiUrl}/analytics/monthly`, {
      params: { year: year.toString() },
      withCredentials: true
    }).pipe(
      tap((response: any) => {
        this.monthlyDataSubject.next(response?.data || response);
      }),
      map((response: any) => {
        const payload = response?.data || response;
        const monthly = payload?.monthlyData || [];

        return {
          labels: monthly.map(m => m.month),
          credits: monthly.map(m => m.credit?.total || 0),
          debits: monthly.map(m => m.debit?.total || 0),
          raw: payload
        };
      })
    );
  }

  /**
   * Get transaction summary (credit vs debit)
   */
  getTransactionSummary(startDate, endDate) {
    return this.http.get(`${this.apiUrl}/analytics/summary`, {
      params: { startDate, endDate },
      withCredentials: true
    }).pipe(
      tap((response: any) => {
        this.summarySubject.next(response.data || response);
      })
    );
  }

  /**
   * Get spending by category
   */
  getSpendingByCategory() {
    return this.http.get(`${this.apiUrl}/analytics/spending`, {
      withCredentials: true
    });
  }

  /**
   * Generate mock data for demonstration
   */
  getMockMonthlyData() {
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      credits: [4500, 5200, 4800, 5500, 6000, 5800, 6200, 5900, 6500, 7000, 6800, 7500],
      debits: [3200, 3800, 3500, 4000, 4200, 3900, 4500, 4200, 4800, 5000, 4600, 5200]
    };
  }

  getMockSummaryData() {
    return {
      totalCredit: 71700,
      totalDebit: 50900,
      netBalance: 20800,
      transactionCount: 156,
      averageTransaction: 785.26
    };
  }
}
