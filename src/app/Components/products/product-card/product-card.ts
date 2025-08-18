import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule , RouterModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css'
})
export class ProductCard {

    @Input() product: any;

    constructor() {}


    getStars(rating: number): string {
  let fullStars = Math.floor(rating);
  let halfStar = rating % 1 >= 0.5 ? 1 : 0;
  let emptyStars = 5 - fullStars - halfStar;

  let starsHtml = '';

  for (let i = 0; i < fullStars; i++) {
    starsHtml += `<i class="bi bi-star-fill text-warning"></i>`;
  }
  if (halfStar) {
    starsHtml += `<i class="bi bi-star-half text-warning"></i>`;
  }
  for (let i = 0; i < emptyStars; i++) {
    starsHtml += `<i class="bi bi-star text-warning"></i>`;
  }

  return starsHtml;
}

}
