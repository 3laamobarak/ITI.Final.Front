import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ProductSlider } from '../products/product-slider/product-slider';
import { ProductServices } from '../../Services/product-services';
import { IProduct } from '../../Models/iproduct';
import { CategorySlider } from '../Categories/cateory-slider/cateory-slider';
import { ICategory } from '../../Models/icategory';
import { CategoryServices } from '../../Services/category-services';
import { RouterLink } from '@angular/router';
import { BrandService } from '../../Services/brand-service';

@Component({
  selector: 'app-home',
  imports: [ProductSlider, CategorySlider, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  // Product collections
  products: IProduct[] = [];
  newArrivals: IProduct[] = [];
  trendingProducts: IProduct[] = [];
  categories: ICategory[] = [];
  featuredBrands: any[] = [];

  constructor(
    private cd: ChangeDetectorRef,
    private productServices: ProductServices,
    private categoryServices: CategoryServices,
    private brandService: BrandService
  ) {}

  ngOnInit(): void {
    // Load products
    this.productServices.getAllProducts().subscribe({
      next: (data) => {
        // Store all products
        const allProducts = data;
        
        // New arrivals - sort by creation date
        this.newArrivals = [...allProducts]
          .sort((a, b) => 
            new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime())
          .slice(0, 6);

        // Trending products - sort by quantity sold
        this.trendingProducts = [...allProducts]
          .sort((a, b) => b.QuantitySold - a.QuantitySold)
          .slice(0, 6);
          
        // Best sellers - also sorted by quantity sold but different selection
        this.products = [...allProducts]
          .sort((a, b) => b.QuantitySold - a.QuantitySold)
          .slice(0, 6);

        this.cd.detectChanges();
      },
      error: (err) => console.error('Error loading products:', err),
    });

    // Load categories
    this.categoryServices.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error loading categories:', err)
    });
    
    // Load featured brands
    this.brandService.getAllBrands().subscribe({
      next: (data) => {
        this.featuredBrands = data.slice(0, 6); // Get top 6 brands
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error loading brands:', err)
    });
  }
}

