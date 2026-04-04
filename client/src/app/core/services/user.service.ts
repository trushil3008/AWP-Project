import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;
  private userSubject = new BehaviorSubject(null);
  
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get current user profile
   */
  getProfile() {
    return this.http.get(`${this.apiUrl}/auth/me`, { 
      withCredentials: true 
    }).pipe(
      tap((response: any) => {
        this.userSubject.next(response?.data?.user || null);
      })
    );
  }

  /**
   * Update user profile
   */
  updateProfile(data) {
    return throwError(() => new Error('Profile update endpoint is not implemented on the backend.'));
  }

  /**
   * Change password
   */
  changePassword(data) {
    return this.http.patch(`${this.apiUrl}/auth/update-password`, data, { 
      withCredentials: true 
    });
  }

  /**
   * Get current user value
   */
  getCurrentUser() {
    return this.userSubject.value;
  }
}
