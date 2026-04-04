import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BeneficiaryService {
  private apiUrl = environment.apiUrl;
  
  private beneficiariesSubject = new BehaviorSubject([]);
  beneficiaries$ = this.beneficiariesSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all beneficiaries
   */
  getBeneficiaries() {
    return this.http.get(`${this.apiUrl}/beneficiaries`, { 
      withCredentials: true 
    }).pipe(
      tap((response: any) => {
        this.beneficiariesSubject.next(response.data || response || []);
      })
    );
  }

  /**
   * Add a new beneficiary
   */
  addBeneficiary(data) {
    const payload = {
      beneficiaryAccountNumber: data?.accountNumber || data?.beneficiaryAccountNumber,
      name: data?.name,
      nickname: data?.nickname
    };

    return this.http.post(`${this.apiUrl}/beneficiaries`, payload, { 
      withCredentials: true 
    }).pipe(
      tap(() => {
        // Refresh the list after adding
        this.getBeneficiaries().subscribe();
      })
    );
  }

  /**
   * Delete a beneficiary
   */
  deleteBeneficiary(id) {
    return this.http.delete(`${this.apiUrl}/beneficiaries/${id}`, { 
      withCredentials: true 
    }).pipe(
      tap(() => {
        // Update local state
        const current = this.beneficiariesSubject.value;
        this.beneficiariesSubject.next(current.filter(b => b.id !== id));
      })
    );
  }

  /**
   * Verify account number
   */
  verifyAccount(accountNumber) {
    return this.http.get(`${this.apiUrl}/account/verify/${accountNumber}`, { 
      withCredentials: true 
    });
  }

  /**
   * Check if beneficiary already exists
   */
  isDuplicate(accountNumber) {
    const beneficiaries = this.beneficiariesSubject.value;
    return beneficiaries.some(b => b.accountNumber === accountNumber);
  }

  /**
   * Get current beneficiaries
   */
  getCurrentBeneficiaries() {
    return this.beneficiariesSubject.value;
  }
}
