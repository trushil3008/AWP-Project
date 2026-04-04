import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject(null);
  
  currentUser$ = this.currentUserSubject.asObservable();
  
  // Signals for reactive state
  isAuthenticated = signal(false);
  isAdmin = signal(false);
  isLoading = signal(true);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check authentication status on service initialization
    this.checkAuthStatus();
  }

  /**
   * Check if user is authenticated by calling the /me endpoint
   * This works with HTTP-only cookies
   */
  checkAuthStatus() {
    this.isLoading.set(true);
    
    this.http.get(`${this.apiUrl}/auth/me`, { withCredentials: true })
      .pipe(
        tap((response: any) => {
          const user = response?.data?.user || null;
          this.currentUserSubject.next(user);
          this.isAuthenticated.set(true);
          this.isAdmin.set(user?.role === 'admin');
          this.isLoading.set(false);
        }),
        catchError((error) => {
          this.currentUserSubject.next(null);
          this.isAuthenticated.set(false);
          this.isAdmin.set(false);
          this.isLoading.set(false);
          return of(null);
        })
      )
      .subscribe();
  }

  /**
   * Login user with email and password
   */
  login(credentials) {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials, { 
      withCredentials: true 
    }).pipe(
      tap((response: any) => {
        const user = response?.data?.user || null;
        this.currentUserSubject.next(user);
        this.isAuthenticated.set(true);
        this.isAdmin.set(user?.role === 'admin');
      })
    );
  }

  /**
   * Register new user
   */
  register(userData) {
    return this.http.post(`${this.apiUrl}/auth/register`, userData, { 
      withCredentials: true 
    }).pipe(
      tap((response: any) => {
        const user = response?.data?.user || null;
        this.currentUserSubject.next(user);
        this.isAuthenticated.set(true);
        this.isAdmin.set(user?.role === 'admin');
      })
    );
  }

  /**
   * Logout user and clear session
   */
  logout() {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}, { 
      withCredentials: true 
    }).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        this.isAuthenticated.set(false);
        this.isAdmin.set(false);
        this.router.navigate(['/auth/login']);
      }),
      catchError((error) => {
        // Even if logout fails on server, clear local state
        this.currentUserSubject.next(null);
        this.isAuthenticated.set(false);
        this.isAdmin.set(false);
        this.router.navigate(['/auth/login']);
        return of(null);
      })
    );
  }

  /**
   * Get current user value
   */
  getCurrentUser() {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user has admin role
   */
  hasAdminRole() {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }
}
