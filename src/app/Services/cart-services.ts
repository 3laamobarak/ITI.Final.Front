import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { CartItem } from '../Models/ICartItem';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartServices {
  private apiUrl = `${environment.apiUrl}/Cart`;
  private cartCount = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {
    this.refreshCartCount();
  }

  getCartCount(): Observable<number> {
    return this.cartCount.asObservable();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('Token not found. User might not be logged in.');
      // throw new Error('User is not logged in');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getCartItems(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(this.apiUrl, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(err => {
          console.error('Failed to fetch cart items', err);
          return throwError(() => new Error('Failed to fetch cart items'));
        })
      );
  }

  private refreshCartCount() {
    this.getCartItems().subscribe({
      next: items => {
        const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
        this.cartCount.next(totalQty);
      },
      error: err => console.error('Failed to refresh cart count', err)
    });
  }

  addToCart(productId: number, quantity: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, { productId, quantity }, { headers: this.getAuthHeaders() })
      .pipe(
        tap(() => this.refreshCartCount()),
        catchError(err => {
          console.error('Failed to add product to cart', err);
          return throwError(() => new Error('Failed to add product to cart'));
        })
      );
  }

  removeFromCart(itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/remove/${itemId}`, { headers: this.getAuthHeaders() })
      .pipe(
        tap(() => this.refreshCartCount()),
        catchError(err => {
          console.error('Failed to remove product from cart', err);
          return throwError(() => new Error('Failed to remove product from cart'));
        })
      );
  }

  updateQuantity(itemId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, { itemId, quantity }, { headers: this.getAuthHeaders() })
      .pipe(
        tap(() => this.refreshCartCount()),
        catchError(err => {
          console.error('Failed to update quantity', err);
          return throwError(() => new Error('Failed to update quantity'));
        })
      );
  }

  clearCart(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clear`, { headers: this.getAuthHeaders() })
      .pipe(
        tap(() => this.cartCount.next(0)),
        catchError(err => {
          console.error('Failed to clear cart', err);
          return throwError(() => new Error('Failed to clear cart'));
        })
      );
  }
}
