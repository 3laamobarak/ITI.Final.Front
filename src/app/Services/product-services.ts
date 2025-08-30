  import { Injectable } from '@angular/core';
  import { IProduct } from '../Models/iproduct';
  import { Observable } from 'rxjs';
  import { HttpClient } from '@angular/common/http';
  import { environment } from '../../environments/environment';

  @Injectable({
    providedIn: 'root'
  })
  export class ProductServices {

    private apiUrl = environment.apiUrl

    constructor(private http: HttpClient) {}

    getAllProducts(): Observable<IProduct[]> {
      
      return this.http.get<IProduct[]>(`${this.apiUrl}/Products/all`);
    }



    getProductById(id: number): Observable<IProduct> {
      return this.http.get<IProduct>(`${this.apiUrl}/Products/${id}`);
    }
    
  }
