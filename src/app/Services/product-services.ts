import { Injectable } from '@angular/core';
import { IProduct } from '../Models/iproduct';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
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

  getAllProducts(): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(`${this.apiUrl}/Products/all`);
  }

  getProductById(id: string): Observable<IProduct> {
    return this.http.get<IProduct>(`${this.apiUrl}/Products/${id}`);
  }

  getSuggestionsFromApi(q: string): Observable<IproductSuggestion[]> {
    if (!q) return of([]);
    return this.http.get<IproductSuggestion[]>(
      `${this.apiUrl}/Products/suggestions?q=${encodeURIComponent(q)}`
    );
  }

  getSuggestionsClient(q: string): Observable<IproductSuggestion[]> {
    if (!q) return of([]);
    return this.getAllProducts().pipe(
      map((list) =>
        (list || [])
          .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
          .slice(0, 8)
          .map((p) => ({ id: p.id, name: p.name, imageUrl: p.imageUrl || '' }))
      )
    );
  }
  getCategories(): Observable<ICategorySmall[]> {
    return this.http.get<ICategorySmall[]>(`${this.apiUrl}/Category`); // غيّري لو endpoint مختلف
  }
}
