import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = environment.apiUrl;
  
  private accountSubject = new BehaviorSubject(null);
  account$ = this.accountSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get account details
   */
  getAccount() {
    return this.http.get(`${this.apiUrl}/account`, { withCredentials: true }).pipe(
      tap((response: any) => {
        this.accountSubject.next(response.data || response);
      })
    );
  }

  /**
   * Get account statement
   */
  getStatement(startDate, endDate) {
    return this.http.get(`${this.apiUrl}/transactions`, {
      params: { startDate, endDate },
      withCredentials: true
    }).pipe(
      map((response: any) => response?.data?.transactions || response?.data || response || [])
    );
  }

  /**
   * Download statement as PDF
   */
  downloadStatement(startDate, endDate) {
    return this.getStatement(startDate, endDate).pipe(
      map((transactions: any[]) => {
        const header = 'Date,Type,Amount,Status,Description,Reference';
        const rows = transactions.map((t: any) => {
          const date = t.createdAt || '';
          const type = t.type || '';
          const amount = t.amount ?? '';
          const status = t.status || '';
          const description = (t.description || '').replace(/,/g, ' ');
          const reference = (t.reference || '').replace(/,/g, ' ');
          return `${date},${type},${amount},${status},${description},${reference}`;
        });

        const csv = [header, ...rows].join('\n');
        return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
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
