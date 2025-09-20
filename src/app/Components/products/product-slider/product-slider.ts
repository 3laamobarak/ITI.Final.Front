import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { register } from 'swiper/element/bundle';
import { IProduct } from '../../../Models/iproduct';
import { ProductCard } from '../product-card/product-card';

register(); 

@Component({
  selector: 'app-product-slider',
  imports: [CommonModule, ProductCard],
  templateUrl: './product-slider.html',
  styleUrl: './product-slider.css',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProductSlider implements AfterViewInit {

  @ViewChild('swiperContainer') swiperContainer!: ElementRef;

  @Input() products: IProduct[] = [];

  swiperParams = {
    slidesPerView: 5,
    spaceBetween: 15,
    navigation: false, // We'll use custom navigation
    pagination: { clickable: true, el: '.swiper-pagination' },
    breakpoints: {
      320: {
        slidesPerView: 2,
        spaceBetween: 10
      },
      576: {
        slidesPerView: 3,
        spaceBetween: 15
      },
      768: {
        slidesPerView: 4,
        spaceBetween: 15
      },
      992: {
        slidesPerView: 5,
        spaceBetween: 15
      }
    }
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

  slideNext(): void {
    if (this.swiperContainer && this.swiperContainer.nativeElement.swiper) {
      this.swiperContainer.nativeElement.swiper.slideNext();
    }
  }

  slidePrev(): void {
    if (this.swiperContainer && this.swiperContainer.nativeElement.swiper) {
      this.swiperContainer.nativeElement.swiper.slidePrev();
    }
  }
}
