import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;
  
  private usersSubject = new BehaviorSubject([]);
  private statsSubject = new BehaviorSubject(null);
  
  users$ = this.usersSubject.asObservable();
  stats$ = this.statsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get dashboard statistics
   */
  getDashboardStats() {
    return this.http.get(`${this.apiUrl}/admin/stats`, { 
      withCredentials: true 
    }).pipe(
      tap((response: any) => {
        this.statsSubject.next(response.data || response);
      })
    );
  }

  /**
   * Get all users
   */
  getUsers(params = {}) {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    return this.http.get(`${this.apiUrl}/admin/users`, { 
      params: httpParams,
      withCredentials: true 
    }).pipe(
      tap((response: any) => {
        const users = response?.data?.users || response?.data || response || [];
        this.usersSubject.next(users);
      }),
      map((response: any) => {
        const users = response?.data?.users || response?.data || response || [];
        return users.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          status: user?.account?.status,
          accountId: user?.account?.id,
          accountNumber: user?.account?.accountNumber,
          balance: user?.account?.balance
        }));
      })
    );
  }

  /**
   * Freeze user account
   */
  freezeAccount(userId) {
    return this.http.patch(`${this.apiUrl}/admin/users/${userId}/freeze`, {}, { 
      withCredentials: true 
    });
  }

  /**
   * Unfreeze user account
   */
  unfreezeAccount(userId) {
    return this.http.patch(`${this.apiUrl}/admin/users/${userId}/unfreeze`, {}, { 
      withCredentials: true 
    });
  }

  /**
   * Get all transactions (admin view)
   */
  getAllTransactions(params = {}) {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    return this.http.get(`${this.apiUrl}/admin/transactions`, { 
      params: httpParams,
      withCredentials: true 
    }).pipe(
      map((response: any) => response?.data?.transactions || response?.data || response || [])
    );
  }

  /**
   * Get user by ID
   */
  getUserById(userId) {
    return this.http.get(`${this.apiUrl}/admin/users/${userId}`, { 
      withCredentials: true 
    });
  }
}
