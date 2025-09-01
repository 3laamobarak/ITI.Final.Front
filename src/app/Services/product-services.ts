import { Injectable } from '@angular/core';
import { IProduct } from '../Models/iproduct';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { IproductSuggestion } from '../Models/iproduct-suggestion';
import { ICategorySmall } from '../Models/icategory-small';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProductServices {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // 🔹 Get all products
  getAllProducts(): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(`${this.apiUrl}/Products/all`);
  }

  // 🔹 Get product by ID (public endpoint)
  getProductById(id: number | string): Observable<IProduct> {
    return this.http.get<IProduct>(`${this.apiUrl}/Products/${id}`);
  }

  // 🔹 Get product by ID (with token authentication)
  getProductByIdWithAuth(id: number | string): Observable<IProduct> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<IProduct>(`${this.apiUrl}/Products/${id}`, { headers });
  }

  // 🔹 Get suggestions from API endpoint
  getSuggestionsFromApi(q: string): Observable<IproductSuggestion[]> {
    if (!q) return of([]);
    return this.http.get<IproductSuggestion[]>(
      `${this.apiUrl}/Products/suggestions?q=${encodeURIComponent(q)}`
    );
  }

  // 🔹 Get suggestions client-side (fallback if API not available)
  getSuggestionsClient(q: string): Observable<IproductSuggestion[]> {
    if (!q) return of([]);
    return this.getAllProducts().pipe(
      map((list) =>
        (list || [])
          .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
          .slice(0, 8)
          .map((p) => ({
            id: p.id,
            name: p.name,
            imageUrl: (p as any).imageUrl || '',
          }))
      )
    );
  }

  // 🔹 Get small category list
  getCategories(): Observable<ICategorySmall[]> {
    return this.http.get<ICategorySmall[]>(`${this.apiUrl}/Category`);
  }
}
