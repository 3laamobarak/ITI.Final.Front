import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  private apiUrl = environment.apiUrl; // غيري الـ URL حسب الـ API عندك

  constructor(private http: HttpClient) {}

  // جلب كل البراندات
  getAllBrands(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Brand?skip=0&take=100`).pipe(
      map(brands => brands.map(b => ({
        id: b.id,
        name: b.name,
        description: b.description,
        count: 0 // Will be calculated in the component
      })))
    );
  }

  // جلب كل المنتجات
  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products`);
  }

  // بحث عن منتج
  searchProducts(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products?q=${query}`);
  }
}
