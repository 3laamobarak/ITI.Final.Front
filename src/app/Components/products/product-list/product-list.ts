import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { ProductServices } from '../../../Services/product-services';
import { IProduct } from '../../../Models/iproduct';
import { CommonModule } from '@angular/common';
import { ProductCard } from '../product-card/product-card';
import { BrandService } from '../../../Services/brand-service';
import { CategoryServices } from '../../../Services/category-services';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, ProductCard, FormsModule],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css'],
})
export class ProductList implements OnInit, OnDestroy {
  products: IProduct[] = [];
  allProducts: IProduct[] = [];
  brands: any[] = [];
  categories: any[] = [];
  selectedBrandId: number | null = null;
  selectedCategoryId: number | null = null;

  // Search functionality
  searchQuery = '';
  searchSuggestions: any[] = [];
  showSuggestions = false;
  private search$ = new Subject<string>();
  private subs: Subscription[] = [];

  // Brand search
  brandSearch = '';
  private brandSearch$ = new Subject<string>();

  // Show more
  showAllBrands = false;
  showAllCategories = false;
  topLimit = 8;

  // Mobile filters
  showMobileFilters = false;

  // Collapsible sections
  collapsedSections = {
    search: false,
    category: false,
    brand: false,
    price: false,
    rating: false,
    availability: false
  };

  // Sorting
  sortOption = 'featured';
  sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest First' },
    { value: 'trending', label: 'Trending' },
    { value: 'best-sellers', label: 'Best Sellers' }
  ];

  // Price filter
  priceRanges = [
    { id: 1, label: 'Under $50', min: 0, max: 50 },
    { id: 2, label: '$50 - $100', min: 50, max: 100 },
    { id: 3, label: '$100 - $200', min: 100, max: 200 },
    { id: 4, label: '$200 - $500', min: 200, max: 500 },
    { id: 5, label: 'Above $500', min: 500, max: Infinity },
  ];
  selectedPriceRangeId: number | null = null;
  customMinPrice: number | null = null;
  customMaxPrice: number | null = null;
  showCustomPrice = false;

  // Rating options
  ratingOptions: number[] = [5, 4, 3, 2, 1];
  selectedRating: number | null = null;
  ratingCounts: { rating: number; count: number }[] = [];

  // Availability filter
  availabilityOptions = [
    { value: 'in-stock', label: 'In Stock', count: 0 },
    { value: 'low-stock', label: 'Low Stock', count: 0 },
    { value: 'out-of-stock', label: 'Out of Stock', count: 0 }
  ];
  selectedAvailability: string | null = null;

  // Loading states
  isLoading = true;
  isSearching = false;

  // Filter state
  activeFilters: { type: string; value: any; label: string }[] = [];

  constructor(
    private cd: ChangeDetectorRef,
    private productServices: ProductServices,
    private brandService: BrandService,
    private categoryService: CategoryServices,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeData();
    this.setupSearchFunctionality();
    this.setupBrandSearch();
    this.loadInitialFilters();
  }

  private initializeData(): void {
    // Load brands first to map brand names to IDs
    const sub2 = this.brandService.getAllBrands().subscribe({
      next: (data) => {
        this.brands = (data || []).map((b) => ({ ...b, count: 0 }));
        
        // Load products after brands are loaded
        const sub1 = this.productServices.getAllProducts().subscribe({
          next: (data: any) => {
            this.allProducts = (data || []).map((p: any) => ({
              ...p,
              brandId: this.getBrandIdByName(p.brandName || '')
            }));
            
            
        this.products = [...this.allProducts];
        this.isLoading = false;
        this.calculateAllCounts();
        this.cd.detectChanges();
      },
          error: (err: any) => {
        console.error('Error loading products:', err);
        this.isLoading = false;
        this.cd.detectChanges();
      },
    });
    this.subs.push(sub1);

        this.cd.detectChanges();
      },
      error: (err) => console.error('Error loading brands:', err),
    });
    this.subs.push(sub2);

    // Load categories
    const sub3 = this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = (data || []).map((c) => ({ ...c, count: 0 }));
        this.calculateCategoryCounts();
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error loading categories:', err),
    });
    this.subs.push(sub3);
  }

  private setupSearchFunctionality(): void {
    const sub = this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query) => {
        if (!query || query.length < 2) {
          this.searchSuggestions = [];
          this.showSuggestions = false;
          return of([]);
        }
        this.isSearching = true;
        return this.productServices.getSuggestionsFromApi(query).pipe(
          catchError(() => this.productServices.getSuggestionsClient(query))
        );
      })
    ).subscribe({
      next: (suggestions) => {
        this.searchSuggestions = suggestions || [];
        this.showSuggestions = this.searchSuggestions.length > 0;
        this.isSearching = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Search error:', err);
        this.isSearching = false;
        this.cd.detectChanges();
      }
    });
    this.subs.push(sub);
  }

  private setupBrandSearch(): void {
    const sub = this.brandSearch$.pipe(debounceTime(250)).subscribe((term) => {
      this.brandSearch = term;
      this.cd.detectChanges();
    });
    this.subs.push(sub);
  }

  private loadInitialFilters(): void {
    this.route.queryParams.subscribe((params) => {
      const search = (params['search'] || '').toString().trim();
      if (search) {
        this.searchQuery = search;
        this.applySearchFilter(search);
      }
      
      // Load other filters from URL params
      if (params['brand']) {
        this.selectedBrandId = parseInt(params['brand']);
      }
      if (params['category']) {
        this.selectedCategoryId = parseInt(params['category']);
      }
      if (params['price']) {
        this.selectedPriceRangeId = parseInt(params['price']);
      }
      if (params['rating']) {
        this.selectedRating = parseInt(params['rating']);
      }
      if (params['availability']) {
        this.selectedAvailability = params['availability'];
      }
      if (params['sort']) {
        this.sortOption = params['sort'];
      }
      
      this.updateActiveFilters();
      this.applyAllFilters();
    });
  }

  // Toggle mobile filters
  toggleMobileFilters() {
    this.showMobileFilters = !this.showMobileFilters;
    // Add body class to prevent scrolling when filters are open
    if (this.showMobileFilters) {
      document.body.classList.add('filters-open');
    } else {
      document.body.classList.remove('filters-open');
    }
  }

  // Toggle collapsible sections
  // toggleSection(section: string) {
  //   this.collapsedSections[section] = !this.collapsedSections[section];
  // }

  // Check if any filters are active
  hasActiveFilters(): boolean {
    return this.selectedBrandId !== null || 
           this.selectedCategoryId !== null ||
           this.selectedPriceRangeId !== null || 
           this.selectedRating !== null ||
           this.selectedAvailability !== null ||
           this.searchQuery.trim() !== '';
  }

  // Count active filters
  getActiveFiltersCount(): number {
    let count = 0;
    if (this.selectedBrandId !== null) count++;
    if (this.selectedCategoryId !== null) count++;
    if (this.selectedPriceRangeId !== null) count++;
    if (this.selectedRating !== null) count++;
    if (this.selectedAvailability !== null) count++;
    if (this.searchQuery.trim() !== '') count++;
    return count;
  }

  // Clear all filters
  clearAllFilters() {
    this.selectedBrandId = null;
    this.selectedCategoryId = null;
    this.selectedPriceRangeId = null;
    this.selectedRating = null;
    this.selectedAvailability = null;
    this.searchQuery = '';
    this.brandSearch = '';
    this.customMinPrice = null;
    this.customMaxPrice = null;
    this.showCustomPrice = false;
    this.products = [...this.allProducts];
    this.updateActiveFilters();
    this.updateUrlParams();
    this.cd.detectChanges();
  }

  // Clear price filter
  clearPriceFilter() {
    this.selectedPriceRangeId = null;
    this.applyAllFilters();
  }

  // Clear brand search
  clearBrandSearch() {
    this.brandSearch = '';
    this.search$.next('');
    this.cd.detectChanges();
  }

  // Get selected brand name
  getSelectedBrandName(): string {
    if (this.selectedBrandId === null) return 'All Brands';
    const brand = this.brands.find(b => b.id === this.selectedBrandId);
    return brand ? brand.name : '';
  }

  // Get selected price range label
  getSelectedPriceRangeLabel(): string {
    if (this.selectedPriceRangeId === null) return 'All Prices';
    const range = this.priceRanges.find(r => r.id === this.selectedPriceRangeId);
    return range ? range.label : '';
  }

  // Apply all filters together
  applyAllFilters() {
    // If a category is selected, don't apply client-side category filtering
    // as it's handled by the backend API
    if (this.selectedCategoryId !== null) {
      return;
    }
    
    // Start with all products
    let filteredProducts = [...this.allProducts];
    
    // Apply search filter
    if (this.searchQuery.trim()) {
      const searchTerm = this.searchQuery.toLowerCase();
      filteredProducts = filteredProducts.filter(p =>
        (p.name || '').toLowerCase().includes(searchTerm) ||
        (p.description || '').toLowerCase().includes(searchTerm) ||
        (p.Overview || '').toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply brand filter
    if (this.selectedBrandId !== null) {
      filteredProducts = filteredProducts.filter(p => p.brandId === this.selectedBrandId);
    }
    
    // Apply price filter
    if (this.selectedPriceRangeId !== null) {
      const range = this.priceRanges.find(r => r.id === this.selectedPriceRangeId);
      if (range) {
        filteredProducts = filteredProducts.filter(
          p => p.price >= range.min && p.price <= range.max
        );
      }
    }
    
    // Apply custom price filter
    if (this.customMinPrice !== null || this.customMaxPrice !== null) {
      filteredProducts = filteredProducts.filter(p => {
        const price = p.price;
        const min = this.customMinPrice !== null ? this.customMinPrice : 0;
        const max = this.customMaxPrice !== null ? this.customMaxPrice : Infinity;
        return price >= min && price <= max;
      });
    }
    
    // Apply rating filter
    if (this.selectedRating !== null) {
      filteredProducts = filteredProducts.filter(
        p => this.getProductAverage(p) >= this.selectedRating!
      );
    }
    
    // Apply availability filter
    if (this.selectedAvailability !== null) {
      filteredProducts = filteredProducts.filter(p => {
        const stock = p.stockQuantity || 0;
        switch (this.selectedAvailability) {
          case 'in-stock':
            return stock > 10;
          case 'low-stock':
            return stock > 0 && stock <= 10;
          case 'out-of-stock':
            return stock === 0;
          default:
            return true;
        }
      });
    }
    
    // Apply sorting
    this.products = this.sortProducts(filteredProducts);
    this.cd.detectChanges();
  }

  // Apply sorting
  applySorting() {
    this.products = this.sortProducts(this.products);
    this.cd.detectChanges();
  }

  // Sort products based on selected option
  sortProducts(products: IProduct[]): IProduct[] {
    const sorted = [...products];
    
    switch (this.sortOption) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => this.getProductAverage(b) - this.getProductAverage(a));
      case 'newest':
        return sorted.sort((a, b) => {
          const dateA = a.CreatedAt ? new Date(a.CreatedAt).getTime() : 0;
          const dateB = b.CreatedAt ? new Date(b.CreatedAt).getTime() : 0;
          return dateB - dateA;
        });
      case 'trending':
        return sorted.sort((a, b) => (b.QuantitySold || 0) - (a.QuantitySold || 0));
      case 'best-sellers':
        return sorted.sort((a, b) => {
          const aScore = (this.getProductAverage(a) * 0.7) + ((a.QuantitySold || 0) * 0.3);
          const bScore = (this.getProductAverage(b) * 0.7) + ((b.QuantitySold || 0) * 0.3);
          return bScore - aScore;
        });
      default: // featured
        return sorted.sort((a, b) => {
          // Featured: combination of rating and recent sales
          const aScore = (this.getProductAverage(a) * 0.6) + ((a.QuantitySold || 0) * 0.4);
          const bScore = (this.getProductAverage(b) * 0.6) + ((b.QuantitySold || 0) * 0.4);
          return bScore - aScore;
        });
    }
  }

  // Filter by price
  filterByPrice() {
    this.updateActiveFilters();
    this.updateUrlParams();
    this.applyAllFilters();
  }

  // Get product average rating
  getProductAverage(p: any): number {
    if (!p) return 0;
    
    // Use the averageRating directly from the backend
    if (typeof p.averageRating === 'number' && p.averageRating > 0) {
      return p.averageRating;
    }
    
    // Fallback: if averageRating is not available, return 0
    return 0;
  }

  // Compute rating counts
  computeRatingCounts() {
    this.ratingCounts = this.ratingOptions.map((r) => {
      const cnt = (this.allProducts || []).filter(
        (p) => this.getProductAverage(p) >= r
      ).length;
      return { rating: r, count: cnt };
    });
  }

  // Get rating count
  getRatingCount(rating: number): number {
    if (!this.ratingCounts) return 0;
    const item = this.ratingCounts.find((rc) => rc.rating === rating);
    return item ? item.count : 0;
  }

  // Set rating filter
  setRatingFilter(rating: number | null) {
    this.selectedRating = rating;
    this.updateActiveFilters();
    this.updateUrlParams();
    this.applyAllFilters();
  }

  // Apply search filter
  applySearchFilter(search: string) {
    if (!search) {
      this.products = [...this.allProducts];
      return;
    }

    const searchTerm = search.toLowerCase();
    this.products = this.allProducts.filter(
      (p) =>
        (p.name || '').toLowerCase().includes(searchTerm) ||
        (p.description || '').toLowerCase().includes(searchTerm) ||
        (p.Overview || '').toLowerCase().includes(searchTerm)
    );

    this.cd.detectChanges();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    // Remove body class if component is destroyed while filters are open
    document.body.classList.remove('filters-open');
  }


  // Compute counts of products per brand
  calculateBrandCounts() {
    if (!this.allProducts || !this.brands) return;
    this.brands.forEach((b) => (b.count = 0));
    this.allProducts.forEach((p) => {
      const b = this.brands.find((x) => x.id === p.brandId);
      if (b) b.count++;
    });
  }

  // Filter by brand
  filterByBrand(brandId: number | null) {
    this.selectedBrandId = brandId;
    this.updateActiveFilters();
    this.updateUrlParams();
    this.applyAllFilters();
  }

  // Toggle show more brands
  toggleShowAll() {
    this.showAllBrands = !this.showAllBrands;
  }

  // Get displayed brands
  get displayedBrands() {
    const q = (this.brandSearch || '').trim().toLowerCase();
    let list = this.brands.filter((b) => b.name.toLowerCase().includes(q));
    if (!this.showAllBrands) {
      list = list.slice(0, this.topLimit);
    }
    return list;
  }

  // Get displayed categories
  get displayedCategories() {
    let list = this.categories;
    if (!this.showAllCategories) {
      list = list.slice(0, this.topLimit);
    }
    return list;
  }

  // Search functionality
  onSearchInput(value: string) {
    this.searchQuery = value;
    this.search$.next(value);
    
    // Always apply filters when search input changes
    this.updateActiveFilters();
    this.updateUrlParams();
    this.applyAllFilters();
    
    if (value.trim() === '') {
      this.showSuggestions = false;
    }
  }

  onSearchSuggestionClick(suggestion: any) {
    this.searchQuery = suggestion.name;
    this.showSuggestions = false;
    this.updateActiveFilters();
    this.updateUrlParams();
    this.applyAllFilters();
  }

  hideSuggestions() {
    setTimeout(() => {
      this.showSuggestions = false;
      this.cd.detectChanges();
    }, 200);
  }

  // Brand search input handler
  onBrandSearchInput(value: string) {
    this.brandSearch$.next(value);
  }

  // Category filtering
  filterByCategory(categoryId: number | null) {
    this.selectedCategoryId = categoryId;
    this.updateActiveFilters();
    this.updateUrlParams();
    
    if (categoryId === null) {
      // Show all products
      this.applyAllFilters();
    } else {
      // Use backend API to get products by category
      this.loadProductsByCategory(categoryId);
    }
  }

  // Load products by category using backend API
  private loadProductsByCategory(categoryId: number) {
    this.isLoading = true;
    this.cd.detectChanges();
    
    const sub = this.categoryService.getCategoryProducts(categoryId).subscribe({
      next: (data: any) => {
        // Map the products to match our interface
        const categoryProducts = (data || []).map((p: any) => ({
          ...p,
          brandId: this.getBrandIdByName(p.brandName || ''),
          ProductCategories: p.CategoryName ? [p.CategoryName] : (p.categoryName ? [p.categoryName] : [])
        }));
        
        // Apply other filters to the category products
        let filteredProducts = [...categoryProducts];
        
        // Apply search filter
        if (this.searchQuery.trim()) {
          const searchTerm = this.searchQuery.toLowerCase();
          filteredProducts = filteredProducts.filter(p =>
            (p.name || '').toLowerCase().includes(searchTerm) ||
            (p.description || '').toLowerCase().includes(searchTerm) ||
            (p.Overview || '').toLowerCase().includes(searchTerm)
          );
        }
        
        // Apply brand filter
        if (this.selectedBrandId !== null) {
          filteredProducts = filteredProducts.filter(p => p.brandId === this.selectedBrandId);
        }
        
        // Apply price filter
        if (this.selectedPriceRangeId !== null) {
          const range = this.priceRanges.find(r => r.id === this.selectedPriceRangeId);
          if (range) {
            filteredProducts = filteredProducts.filter(
              p => p.price >= range.min && p.price <= range.max
            );
          }
        }
        
        // Apply custom price filter
        if (this.customMinPrice !== null || this.customMaxPrice !== null) {
          filteredProducts = filteredProducts.filter(p => {
            const price = p.price;
            const min = this.customMinPrice !== null ? this.customMinPrice : 0;
            const max = this.customMaxPrice !== null ? this.customMaxPrice : Infinity;
            return price >= min && price <= max;
          });
        }
        
        // Apply rating filter
        if (this.selectedRating !== null) {
          filteredProducts = filteredProducts.filter(
            p => this.getProductAverage(p) >= this.selectedRating!
          );
        }
        
        // Apply availability filter
        if (this.selectedAvailability !== null) {
          filteredProducts = filteredProducts.filter(p => {
            const stock = p.stockQuantity || 0;
            switch (this.selectedAvailability) {
              case 'in-stock':
                return stock > 10;
              case 'low-stock':
                return stock > 0 && stock <= 10;
              case 'out-of-stock':
                return stock === 0;
              default:
                return true;
            }
          });
        }
        
        // Apply sorting
        this.products = this.sortProducts(filteredProducts);
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error loading category products:', err);
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
    this.subs.push(sub);
  }

  // Availability filtering
  filterByAvailability(availability: string | null) {
    this.selectedAvailability = availability;
    this.updateActiveFilters();
    this.updateUrlParams();
    this.applyAllFilters();
  }

  // Custom price range
  applyCustomPriceRange() {
    if (this.customMinPrice !== null || this.customMaxPrice !== null) {
      this.selectedPriceRangeId = null;
      this.updateActiveFilters();
      this.updateUrlParams();
      this.applyAllFilters();
    }
  }

  toggleCustomPrice() {
    this.showCustomPrice = !this.showCustomPrice;
    if (!this.showCustomPrice) {
      this.customMinPrice = null;
      this.customMaxPrice = null;
      this.applyAllFilters();
    }
  }

  // Enhanced sorting
  onSortChange() {
    this.updateUrlParams();
    this.applyAllFilters();
  }

  // Update active filters array
  updateActiveFilters() {
    this.activeFilters = [];
    
    if (this.searchQuery.trim()) {
      this.activeFilters.push({
        type: 'search',
        value: this.searchQuery,
        label: `Search: "${this.searchQuery}"`
      });
    }
    
    if (this.selectedCategoryId !== null) {
      const category = this.categories.find(c => c.id === this.selectedCategoryId);
      if (category) {
        this.activeFilters.push({
          type: 'category',
          value: this.selectedCategoryId,
          label: `Category: ${category.name}`
        });
      }
    }
    
    if (this.selectedBrandId !== null) {
      const brand = this.brands.find(b => b.id === this.selectedBrandId);
      if (brand) {
        this.activeFilters.push({
          type: 'brand',
          value: this.selectedBrandId,
          label: `Brand: ${brand.name}`
        });
      }
    }
    
    if (this.selectedPriceRangeId !== null) {
      const range = this.priceRanges.find(r => r.id === this.selectedPriceRangeId);
      if (range) {
        this.activeFilters.push({
          type: 'price',
          value: this.selectedPriceRangeId,
          label: `Price: ${range.label}`
        });
      }
    }
    
    if (this.customMinPrice !== null || this.customMaxPrice !== null) {
      const min = this.customMinPrice || 0;
      const max = this.customMaxPrice || '∞';
      this.activeFilters.push({
        type: 'customPrice',
        value: { min, max },
        label: `Price: $${min} - $${max}`
      });
    }
    
    if (this.selectedRating !== null) {
      this.activeFilters.push({
        type: 'rating',
        value: this.selectedRating,
        label: `Rating: ${this.selectedRating}+ stars`
      });
    }
    
    if (this.selectedAvailability !== null) {
      const option = this.availabilityOptions.find(o => o.value === this.selectedAvailability);
      if (option) {
        this.activeFilters.push({
          type: 'availability',
          value: this.selectedAvailability,
          label: `Availability: ${option.label}`
        });
      }
    }
  }

  // Remove specific filter
  removeFilter(filter: { type: string; value: any; label: string }) {
    switch (filter.type) {
      case 'search':
        this.searchQuery = '';
        break;
      case 'category':
        this.selectedCategoryId = null;
        break;
      case 'brand':
        this.selectedBrandId = null;
        break;
      case 'price':
        this.selectedPriceRangeId = null;
        break;
      case 'customPrice':
        this.customMinPrice = null;
        this.customMaxPrice = null;
        this.showCustomPrice = false;
        break;
      case 'rating':
        this.selectedRating = null;
        break;
      case 'availability':
        this.selectedAvailability = null;
        break;
    }
    this.updateActiveFilters();
    this.updateUrlParams();
    this.applyAllFilters();
  }

  // Update URL parameters
  updateUrlParams() {
    const params: any = {};
    
    if (this.searchQuery.trim()) params.search = this.searchQuery;
    if (this.selectedCategoryId !== null) params.category = this.selectedCategoryId;
    if (this.selectedBrandId !== null) params.brand = this.selectedBrandId;
    if (this.selectedPriceRangeId !== null) params.price = this.selectedPriceRangeId;
    if (this.selectedRating !== null) params.rating = this.selectedRating;
    if (this.selectedAvailability !== null) params.availability = this.selectedAvailability;
    if (this.sortOption !== 'featured') params.sort = this.sortOption;
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge'
    });
  }

  // Calculate all counts
  calculateAllCounts() {
    this.calculateBrandCounts();
    this.calculateCategoryCounts();
    this.computeRatingCounts();
    this.calculateAvailabilityCounts();
  }

  // Calculate category counts
  calculateCategoryCounts() {
    if (!this.allProducts || !this.categories) return;
    this.categories.forEach((c) => (c.count = 0));
    this.allProducts.forEach((p) => {
      if (p.ProductCategories && Array.isArray(p.ProductCategories)) {
        p.ProductCategories.forEach((categoryName) => {
          const category = this.categories.find((c) => c.name === categoryName);
          if (category) category.count++;
        });
      }
    });
  }

  // Calculate availability counts
  calculateAvailabilityCounts() {
    if (!this.allProducts) return;
    
    this.availabilityOptions.forEach((option) => {
      option.count = 0;
    });
    
    this.allProducts.forEach((p) => {
      const stock = p.stockQuantity || 0;
      if (stock > 10) {
        this.availabilityOptions[0].count++; // in-stock
      } else if (stock > 0) {
        this.availabilityOptions[1].count++; // low-stock
      } else {
        this.availabilityOptions[2].count++; // out-of-stock
      }
    });
  }

  // Toggle collapsible sections
  toggleSection(section: keyof typeof this.collapsedSections) {
    this.collapsedSections[section] = !this.collapsedSections[section];
  }

  // Toggle show more categories
  toggleShowAllCategories() {
    this.showAllCategories = !this.showAllCategories;
  }

  // Helper method to get brand ID by name
  private getBrandIdByName(brandName: string): number {
    if (!brandName || !this.brands) return 0;
    const brand = this.brands.find(b => b.name === brandName);
    return brand ? brand.id : 0;
  }
}
