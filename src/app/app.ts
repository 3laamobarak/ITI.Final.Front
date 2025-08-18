import { Component } from '@angular/core';
import { Header } from "./Components/header/header";
import { Footer } from "./Components/footer/footer";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [Header, Footer,RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  protected title = 'FitZone';

}
