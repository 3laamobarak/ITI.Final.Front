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
    return this.http.get<any[]>(`${this.apiUrl}/Products/all`).pipe(
      map(products => products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        description: p.description,
        stockQuantity: p.StockQuantity || p.stockQuantity,
        averageRating: p.AverageRating || p.averageRating,
        reviews: p.ReviewCount || p.reviewCount,
        imageUrl: p.imageUrl,
        brandId: p.brandId || 0, // This will need to be mapped from brandName
        brandName: p.BrandName || p.brandName, // Store brand name for mapping
        ProductCategories: p.CategoryName ? [p.CategoryName] : (p.categoryName ? [p.categoryName] : []),
        CreatedAt: new Date(),
        QuantitySold: 0,
        Overview: p.description
      } as IProduct)))
    );
  }

  // 🔹 Get product by ID (public endpoint)
  getProductById(id: number | string): Observable<IProduct> {
    return this.http.get<any>(`${this.apiUrl}/Products/${id}`).pipe(
      map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        stockQuantity: product.stockQuantity || product.StockQuantity,
        averageRating: product.averageRating || product.AverageRating || 0,
        reviews: product.reviewCount || product.ReviewCount || 0,
        imageUrl: product.imageUrl,
        brandId: product.brandId || product.BrandId || 0,
        brandName: product.brandName || product.BrandName,
        ProductCategories: product.productCategories || product.ProductCategories || [],
        CreatedAt: product.createdAt ? new Date(product.createdAt) : new Date(),
        QuantitySold: product.quantitySold || product.QuantitySold || 0,
        Overview: product.overview || product.Overview || product.description,
        SuggestedUse: product.suggestedUse || product.SuggestedUse,
        Warnings: product.warnings || product.Warnings,
        Disclaimer: product.disclaimer || product.Disclaimer
      } as IProduct))
    );
  }

  // 🔹 Get product by ID (with token authentication)
  getProductByIdWithAuth(id: number | string): Observable<IProduct> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(`${this.apiUrl}/Products/${id}`, { headers }).pipe(
      map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        stockQuantity: product.stockQuantity || product.StockQuantity,
        averageRating: product.averageRating || product.AverageRating || 0,
        reviews: product.reviewCount || product.ReviewCount || 0,
        imageUrl: product.imageUrl,
        brandId: product.brandId || product.BrandId || 0,
        brandName: product.brandName || product.BrandName,
        ProductCategories: product.productCategories || product.ProductCategories || [],
        CreatedAt: product.createdAt ? new Date(product.createdAt) : new Date(),
        QuantitySold: product.quantitySold || product.QuantitySold || 0,
        Overview: product.overview || product.Overview || product.description,
        SuggestedUse: product.suggestedUse || product.SuggestedUse,
        Warnings: product.warnings || product.Warnings,
        Disclaimer: product.disclaimer || product.Disclaimer
      } as IProduct))
    );
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
    return this.http.get<ICategorySmall[]>(`${this.apiUrl}/Category/all`);
  }

  // 🔹 Get products by category name (fallback method)
  getProductsByCategoryName(categoryName: string): Observable<IProduct[]> {
    return this.getAllProducts().pipe(
      map(products => products.filter(product => 
        product.ProductCategories?.includes(categoryName) ||
        (product as any).categoryName === categoryName ||
        (product as any).category === categoryName
      ))
    );
  }
}
