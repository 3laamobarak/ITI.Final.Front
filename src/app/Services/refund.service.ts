import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Refund {
  id: number;
  reason: string;
  amount: number;
  requestDate: string;
  processedDate?: string;
  isProcessed: boolean;
  orderId: number;
  status: string;
}

export interface CreateRefundRequest {
  reason: string;
  amount: number;
  orderId: number;
  paymentId: number;
}

export interface UpdateRefundRequest {
  id: number;
  reason?: string;
  amount: number;
  isProcessed: boolean;
  orderId: number;
}

@Injectable({
  providedIn: 'root'
})
export class RefundService {
  private apiUrl = `${environment.apiUrl}/Refund`;

  constructor(private http: HttpClient) { }

  // Get all refunds with pagination
  getAllRefunds(skip: number = 0, take: number = 10): Observable<Refund[]> {
    return this.http.get<Refund[]>(`${this.apiUrl}/all?skip=${skip}&take=${take}`);
  }

  // Get refund by ID
  getRefundById(id: number): Observable<Refund> {
    return this.http.get<Refund>(`${this.apiUrl}/${id}`);
  }

  // Create a new refund request
  createRefund(refundData: CreateRefundRequest): Observable<Refund> {
    return this.http.post<Refund>(this.apiUrl, refundData);
  }

  // Update an existing refund
  updateRefund(id: number, refundData: UpdateRefundRequest): Observable<Refund> {
    return this.http.put<Refund>(`${this.apiUrl}/${id}`, refundData);
  }

  // Delete a refund
  deleteRefund(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get user's refunds (this would need to be implemented in the backend)
  getUserRefunds(userId?: string): Observable<Refund[]> {
    // For now, we'll get all refunds and filter on the frontend
    // In a real implementation, you'd have a specific endpoint like:
    // return this.http.get<Refund[]>(`${this.apiUrl}/user/${userId}`);
    return this.getAllRefunds(0, 100); // Get more refunds for user filtering
  }
}
