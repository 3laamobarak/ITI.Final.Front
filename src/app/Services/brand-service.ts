import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  private apiUrl = environment.apiUrl; // غيري الـ URL حسب الـ API عندك

  constructor(private http: HttpClient) {}

  // جلب كل البراندات
  getAllBrands(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Brand`);
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
