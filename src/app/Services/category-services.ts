import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ICategory } from '../Models/icategory';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryServices {

   private apiUrl = environment.apiUrl

   constructor(private http: HttpClient) {}

//   getCategories(): Observable<ICategory[]> {
    
//    const categories: ICategory[] = [
//   { name: 'Supplements', subcategories: ['Vitamins', 'Omega-3', 'Probiotics'] },
//   { name: 'Sports', subcategories: ['Protein', 'Pre-Workout', 'Amino Acids'] },
//   { name: 'Bath', subcategories: ['Soap', 'Shower Gel', 'Bath Accessories'] },
//   { name: 'Beauty', subcategories: ['Skincare', 'Makeup', 'Haircare'] },
//   { name: 'Grocery', subcategories: ['Snacks', 'Tea', 'Honey'] },
//   { name: 'Home', subcategories: ['Cleaning', 'Kitchen', 'Laundry'] },
//   { name: 'Baby', subcategories: ['Diapers', 'Formula', 'Toys'] },
//   { name: 'Pets', subcategories: ['Dog Food', 'Cat Food', 'Supplements'] },
//   { name: 'Brands A-Z', subcategories: ['Brand A', 'Brand B', 'Brand C'] },
//   { name: 'Health Topics', subcategories: ['Heart Health', 'Immunity', 'Sleep'] },
//   { name: 'Specials', subcategories: ['Clearance', 'Coupons', 'Deals'] },
//   { name: 'Best Sellers', subcategories: ['Top Rated', 'Most Purchased'] },
//   { name: 'Try', subcategories: ['Samples', 'New Products'] },
//   { name: 'New', subcategories: ['Just Arrived', 'Trending'] },
//   { name: 'Wellness Hub', subcategories: ['Articles', 'Guides', 'Tips'] },
// ];


//     return of(categories); // simulate API response
//   }

  getAllCategories(): Observable<ICategory[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Category/all`).pipe(
      map(categories => categories.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        count: c.productCount || 0 // Use productCount from backend or default to 0
      })))
    );
  }

  // Get products by category ID
  getCategoryProducts(categoryId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Category/${categoryId}/products`);
  }
  
}
