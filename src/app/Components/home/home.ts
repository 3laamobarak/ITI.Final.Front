import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ProductSlider } from '../products/product-slider/product-slider';
import { ProductServices } from '../../Services/product-services';
import { IProduct } from '../../Models/iproduct';
import { CategorySlider } from '../Categories/cateory-slider/cateory-slider';
import { ICategory } from '../../Models/icategory';
import { CategoryServices } from '../../Services/category-services';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [ProductSlider, CategorySlider , RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  products: IProduct[] = [];

  categories: ICategory[] = [];

  constructor(
    private cd: ChangeDetectorRef,
    private productServices: ProductServices,
    private categoryServices: CategoryServices
  ) {}
  ngOnInit(): void {
    this.productServices.getAllProducts().subscribe({
      next: (data) => (this.products = data),

      complete: () => this.cd.detectChanges(),

      error: (err) => console.error('Error:', err),
    });

    this.categoryServices.getAllCategories().subscribe((data) => {
      this.categories = data;

      this.cd.detectChanges();
    });
  }
}
