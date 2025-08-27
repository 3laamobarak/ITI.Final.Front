import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailVerifyService {
  private baseUrl = 'http://3mk-3laa.runasp.net/OTP';

  constructor(private http: HttpClient) {}

  sendCode(email: string): Observable<any> {
    const body = {
      to: email,
      subject: 'Verify your email',
      body: 'Your verification code'
    };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.baseUrl}/send`, body, { headers });
  }

// In `email-verify-service.ts`
  validateCode(email: string, code: string): Observable<any> {
    const body = { email, code };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.baseUrl}/validate`, body, { headers, responseType: 'text' as 'json' });
  }
}
