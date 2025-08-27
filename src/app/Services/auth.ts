import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Iuser } from '../Models/iuser';
import { User } from './user';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiUrl = `${environment.apiUrl}/account`;

  constructor(
    private http: HttpClient,
    private user: User,
    private router: Router
  ) {}

  register(data: Iuser): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/register`, data, { headers }).pipe(
      tap((res: any) => {
        // Save email for verification
        if (data.email) {
          sessionStorage.setItem('verify_email', data.email);
        }
        // Navigate to verify email page
        this.router.navigate(['/verify-email']);
      })
    );
  }

  login(data: any): Observable<any> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, data).pipe(
      tap((res) => {
        if (res && res.token) {
          this.user.setToken(res.token);
          this.router.navigate(['/home']);
        }
      })
    );
  }
}
