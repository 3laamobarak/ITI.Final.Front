import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/Payment`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('User not authenticated');
    }
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  createPayment(paymentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, paymentData, { headers: this.getAuthHeaders() });
  }

  confirmPayment(paymentIntentId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/confirm/${paymentIntentId}`, {}, { headers: this.getAuthHeaders() });
  }
}
