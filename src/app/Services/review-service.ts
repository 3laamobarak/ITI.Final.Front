import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateReviewDto, IReview } from '../Models/ireview';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProductReviews(productId: number): Observable<IReview[]> {
    return this.http.get<IReview[]>(`${this.apiUrl}/Review/products/${productId}/reviews`);
  }

  addReview(productId: number, dto: CreateReviewDto): Observable<void> {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;
    return this.http.post<void>(`${this.apiUrl}/Review/products/${productId}/reviews`, dto, { headers });
  }

  deleteReview(reviewId: number): Observable<void> {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;
    return this.http.delete<void>(`${this.apiUrl}/Review/reviews/${reviewId}`, { headers });
  }
}


