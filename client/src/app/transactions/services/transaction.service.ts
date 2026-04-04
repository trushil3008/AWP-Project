import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = environment.apiUrl;
  
  private transactionsSubject = new BehaviorSubject([]);
  private scheduledSubject = new BehaviorSubject([]);
  
  transactions$ = this.transactionsSubject.asObservable();
  scheduled$ = this.scheduledSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get transactions with filters and pagination
   */
  getTransactions(params = {}) {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    return this.http.get(`${this.apiUrl}/transactions`, { 
      params: httpParams,
      withCredentials: true 
    }).pipe(
      tap((response: any) => {
        const transactions = response?.data?.transactions || response?.data || response || [];
        this.transactionsSubject.next(transactions);
      }),
      map((response: any) => response?.data || response)
    );
  }

  /**
   * Send money to another account
   */
  sendMoney(transferData) {
    return this.http.post(`${this.apiUrl}/transactions/transfer`, transferData, { 
      withCredentials: true 
    });
  }

  /**
   * Schedule a future transfer
   */
  scheduleTransfer(transferData) {
    return this.http.post(`${this.apiUrl}/scheduled`, transferData, { 
      withCredentials: true 
    });
  }

  /**
   * Get scheduled transfers
   */
  getScheduledTransfers() {
    return this.http.get(`${this.apiUrl}/scheduled`, { 
      withCredentials: true 
    }).pipe(
      tap((response: any) => {
        const scheduled = response?.data?.scheduledTransactions || response?.data || response || [];
        this.scheduledSubject.next(scheduled);
      }),
      map((response: any) => response?.data || response)
    );
  }

  /**
   * Cancel a scheduled transfer
   */
  cancelScheduledTransfer(id) {
    return this.http.delete(`${this.apiUrl}/scheduled/${id}`, { 
      withCredentials: true 
    });
  }

  /**
   * Get transaction by ID
   */
  getTransactionById(id) {
    return this.http.get(`${this.apiUrl}/transactions/${id}`, { 
      withCredentials: true 
    });
  }
}
