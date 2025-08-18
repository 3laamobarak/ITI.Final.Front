import { Component, ElementRef, ViewChild, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { register } from 'swiper/element/bundle';
import { ICategory } from '../../../Models/icategory';

register();

@Component({
  selector: 'app-category-slider',
  imports: [CommonModule],
  templateUrl: './cateory-slider.html',
  styleUrls: ['./cateory-slider.css'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CategorySlider implements AfterViewInit {

  @ViewChild('swiperContainer') swiperContainer!: ElementRef;
  @Input() categories: ICategory[] = [];

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.swiperContainer) {
        this.swiperContainer.nativeElement.initialize();
      }
    });
  }
}
