import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { register } from 'swiper/element/bundle';
import { IProduct } from '../../../Models/iproduct';
import { ProductCard } from '../product-card/product-card';

register(); 

@Component({
  selector: 'app-product-slider',
  imports: [CommonModule , ProductCard],
  templateUrl: './product-slider.html',
  styleUrl: './product-slider.css',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProductSlider implements AfterViewInit {

  @ViewChild('swiperContainer') swiperContainer!: ElementRef;

  @Input() products: IProduct[] = [];

  swiperParams = {
    slidesPerView: 4,
    spaceBetween: 20,
    navigation: true,
    // pagination: { clickable: true },
    injectStyles: [
      `.swiper-button-next, .swiper-button-prev { color: #000; }`
    ]
  };

  constructor() {}

  ngAfterViewInit(): void {
    setTimeout(() => {

      if (this.swiperContainer) {

        Object.assign(this.swiperContainer.nativeElement, this.swiperParams);

        this.swiperContainer.nativeElement.initialize();
      }
    });
  }
}
