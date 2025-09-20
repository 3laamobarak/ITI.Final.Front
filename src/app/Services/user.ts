import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class User {
  private tokenKey = 'auth_token';
  TokenUser = 'User_Token'; // Made public for access in components

  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }
  
  setUser(token: string){
    localStorage.setItem(this.TokenUser, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
  }
}