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

  // newArrivals
  newArrivals: IProduct[] = [];

  categories: ICategory[] = [];

  constructor(
    private cd: ChangeDetectorRef,
    private productServices: ProductServices,
    private categoryServices: CategoryServices
  ) {}
  ngOnInit(): void {
    this.productServices.getAllProducts().subscribe({
      next: (data) => {

        // all products
        this.products = data;
        
        // new arrivals
        this.newArrivals = [...this.products]
        .sort((a, b) =>
          new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime())
        .slice(0, 6);

        // trending products
        this.products = [...this.products]
        .sort((a, b) => b.QuantitySold - a.QuantitySold)
        .slice(0, 6);

        this.cd.detectChanges();

      },

      

      error: (err) => console.error('Error:', err),
    });

    this.categoryServices.getAllCategories().subscribe((data) => {
      this.categories = data;

      this.cd.detectChanges();
    });
  }
}
