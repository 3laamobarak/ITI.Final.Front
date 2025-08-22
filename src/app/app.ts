import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from "./Components/header/header";
import { Footer } from "./Components/footer/footer";
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [CommonModule, Header, Footer, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'FitZone';
  isLoginRegisterPage = false;

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      this.isLoginRegisterPage = this.router.url === '/login-register';
    });
  }
}
