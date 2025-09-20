import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { IUserProfile, IOrder, IReward, IMessage, IWishlist } from '../Models/IUserProfile';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('User not authenticated');
    }
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  // Get user profile
  getUserProfile(): Observable<IUserProfile> {
    return this.http.get<IUserProfile>(`${this.apiUrl}/Profile/me`, { headers: this.getAuthHeaders() });
  }

  // Update user profile
  updateProfile(profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/Profile/update-profile`, profileData, { headers: this.getAuthHeaders() });
  }

  // Change password
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/Profile/change-password`, {
      currentPassword,
      newPassword
    }, { headers: this.getAuthHeaders() });
  }

  // Update email
  updateEmail(newEmail: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/Profile/update-email`, {
      newEmail
    }, { headers: this.getAuthHeaders() });
  }

  // Delete account
  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Profile/delete-account`, { headers: this.getAuthHeaders() });
  }

  // Get user orders
  getUserOrders(): Observable<IOrder[]> {
    return this.http.get<IOrder[]>(`${this.apiUrl}/Order`, { headers: this.getAuthHeaders() });
  }

  // Get order by ID
  getOrderById(orderId: number): Observable<IOrder> {
    return this.http.get<IOrder>(`${this.apiUrl}/Order/${orderId}`, { headers: this.getAuthHeaders() });
  }

  // Cancel order
  cancelOrder(orderId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/Order/${orderId}/cancel`, {}, { headers: this.getAuthHeaders() });
  }

  // Get user rewards (mock data for now)
  getUserRewards(): Observable<IReward> {
    // This would be replaced with actual API call when rewards system is implemented
    return of({
      availableRewards: 0.00,
      rewardsCode: 'OHK3181',
      ruleUpdated: true
    });
  }

  // Get user messages (mock data for now)
  getUserMessages(): Observable<IMessage[]> {
    // This would be replaced with actual API call when messaging system is implemented
    return of([
      {
        id: 1,
        subject: 'Welcome to iHerb!',
        content: 'Thank you for joining our community.',
        isRead: false,
        date: new Date().toISOString()
      }
    ]);
  }

  // Get user wishlists (mock data for now)
  getUserWishlists(): Observable<IWishlist[]> {
    // This would be replaced with actual API call when wishlist system is implemented
    return of([
      {
        id: 1,
        name: 'My Favorites',
        items: []
      }
    ]);
  }

  // Get user refunds
  getUserRefunds(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Refund/all`, { headers: this.getAuthHeaders() });
  }

  // Create refund request
  createRefundRequest(refundData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Refund`, refundData, { headers: this.getAuthHeaders() });
  }

  // Get user reviews
  getUserReviews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Review/user-reviews`, { headers: this.getAuthHeaders() });
  }

  // Update review
  updateReview(reviewId: number, reviewData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/Review/reviews/${reviewId}`, reviewData, { headers: this.getAuthHeaders() });
  }

  // Delete review
  deleteReview(reviewId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Review/reviews/${reviewId}`, { headers: this.getAuthHeaders() });
  }

  // Get user categories (for preferences)
  getUserCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Category/all`);
  }

  // Get user brands (for preferences)
  getUserBrands(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Brand`);
  }

  // Get user chat messages
  getUserChatMessages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Chat/user-messages`, { headers: this.getAuthHeaders() });
  }

  // Send chat message
  sendChatMessage(message: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Chat/send`, message, { headers: this.getAuthHeaders() });
  }

  // Get user OTP status
  getUserOTPStatus(): Observable<any> {
    return this.http.get(`${this.apiUrl}/OTP/status`, { headers: this.getAuthHeaders() });
  }

  // Request OTP
  requestOTP(): Observable<any> {
    return this.http.post(`${this.apiUrl}/OTP/request`, {}, { headers: this.getAuthHeaders() });
  }

  // Verify OTP
  verifyOTP(otpData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/OTP/verify`, otpData, { headers: this.getAuthHeaders() });
  }
}
