import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { ProductServices } from '../../../Services/product-services';
import { IProduct } from '../../../Models/iproduct';
import { CommonModule } from '@angular/common';
import { ProductCard } from '../product-card/product-card';
import { BrandService } from '../../../Services/brand-service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, ProductCard, FormsModule],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css'],
})
export class ProductList implements OnInit, OnDestroy {
  products: IProduct[] = []; // المنتجات المعروضة حالياً
  allProducts: IProduct[] = []; // نسخة كاملة للفلترة client-side
  brands: any[] = []; // قائمة البراندات من الـ API
  selectedBrandId: number | null = null;

  // بحث براند
  brandSearch = '';
  private search$ = new Subject<string>();
  private subs: Subscription[] = [];

  // show more
  showAllBrands = false;
  topLimit = 8;

  priceRanges = [
    { id: 1, label: 'Under 100', min: 0, max: 100 },
    { id: 2, label: '100 - 300', min: 100, max: 300 },
    { id: 3, label: '300 - 500', min: 300, max: 500 },
    { id: 4, label: 'Above 500', min: 500, max: Infinity },
  ];
  selectedPriceRangeId: number | null = null;

  filterByPrice() {
    const range = this.priceRanges.find(
      (r) => r.id == this.selectedPriceRangeId
    );
    if (!range) {
      this.products = [...this.allProducts];
    } else {
      this.products = this.allProducts.filter(
        (p) => p.price >= range.min && p.price <= range.max
      );
    }
  }

  //filter by rating
  ratingOptions: number[] = [5, 4, 3, 2, 1];
  selectedRating: number | null = null;
  ratingCounts: { rating: number; count: number }[] = [];

  getProductAverage(p: any): number {
    if (!p) return 0;
    if (typeof p.averageRating === 'number') return p.averageRating;
    if (Array.isArray(p.reviews) && p.reviews.length) {
      const sum = p.reviews.reduce(
        (acc: number, r: any) => acc + (r.rating ?? 0),
        0
      );
      return sum / p.reviews.length;
    }
    return 0;
  }

  computeRatingCounts() {
    this.ratingCounts = this.ratingOptions.map((r) => {
      const cnt = (this.allProducts || []).filter(
        (p) => this.getProductAverage(p) >= r
      ).length;
      return { rating: r, count: cnt };
    });
  }

  getRatingCount(rating: number): number {
    if (!this.ratingCounts) return 0;
    const item = this.ratingCounts.find((rc) => rc.rating === rating);
    return item ? item.count : 0;
  }

  setRatingFilter(rating: number | null) {
    this.selectedRating = rating;
    // إذا عندك دالة موحدة filterProducts() استخدميها، وإلا نطبّق فلترة بسيطة هنا:
    if ((this as any).filterProducts) {
      (this as any).filterProducts();
    } else {
      if (rating === null) this.products = [...this.allProducts];
      else
        this.products = (this.allProducts || []).filter(
          (p) => this.getProductAverage(p) >= rating
        );
    }
    this.cd.detectChanges();
  }

  constructor(
    private cd: ChangeDetectorRef,
    private productServices: ProductServices,
    private brandService: BrandService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const sub1 = this.productServices.getAllProducts().subscribe({
      next: (data) => {
        this.allProducts = data || [];
        this.products = [...this.allProducts];
        this.calculateBrandCounts();
        this.computeRatingCounts();
        this.route.queryParams.subscribe((params) => {
          const search = (params['search'] || '')
            .toString()
            .trim()
            .toLowerCase();
          this.applySearchFilter(search);
        });

        this.cd.detectChanges();
      },
      error: (err) => console.error('Error loading products:', err),
    });
    this.subs.push(sub1);

    const sub2 = this.brandService.getAllBrands().subscribe({
      next: (data) => {
        // ensure deterministic structure and count field
        this.brands = (data || []).map((b) => ({ ...b, count: 0 }));
        this.calculateBrandCounts();
        this.computeRatingCounts();
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error loading brands:', err),
    });
    this.subs.push(sub2);

    const sub3 = this.search$.pipe(debounceTime(250)).subscribe((term) => {
      this.brandSearch = term;
      this.cd.detectChanges();
    });
    this.subs.push(sub3);
  }

  applySearchFilter(search: string) {
    if (!search) {
      // show all if empty
      this.products = [...this.allProducts];
      // re-apply current brand/price/rating filters if needed
      if (this.selectedBrandId !== null)
        this.filterByBrand(this.selectedBrandId);
      if (this.selectedPriceRangeId) this.filterByPrice();
      if (this.selectedRating) this.setRatingFilter(this.selectedRating);
      return;
    }

    this.products = this.allProducts.filter(
      (p) =>
        (p.name || '').toLowerCase().includes(search) ||
        (p.description || '').toLowerCase().includes(search)
      // (p.brandName || '').toLowerCase().includes(search) ||
      // (p.categoryName || '').toLowerCase().includes(search)
    );

    // بعد الفلترة، لو حابة تبقي مرشحات الـ brand/price/rating تعمل على النتيجة
    // لو تريدي ذلك شغلي الدوال التالية بعد الفلترة
    // this.calculateBrandCounts(); this.computeRatingCounts();
    this.cd.detectChanges();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  // input handler for brand search box
  onSearchInput(value: string) {
    this.search$.next(value);
  }

  // compute counts of products per brand (based on allProducts)
  calculateBrandCounts() {
    if (!this.allProducts || !this.brands) return;
    this.brands.forEach((b) => (b.count = 0));
    this.allProducts.forEach((p) => {
      const b = this.brands.find((x) => x.id === p.brandId);
      if (b) b.count++;
    });
  }

  // --- Main filter by brand id (called when clicking a brand) ---
  filterByBrand(brandId: number | null) {
    this.selectedBrandId = brandId;
    if (brandId !== null) {
      this.products = this.allProducts.filter((p) => p.brandId === brandId);
    } else {
      this.products = [...this.allProducts];
    }
    this.cd.detectChanges();
    console.log('Filtered products by brand:', brandId, this.products.length);
  }

  // --- Apply the current brandSearch as filter to products ---
  // finds all brands whose name contains the search term, then filters products to those brandIds
  applyBrandSearchToProducts() {
    const q = (this.brandSearch || '').trim().toLowerCase();
    if (!q) {
      // if empty search, clear filter (show all)
      this.filterByBrand(null);
      return;
    }

    const matchedBrandIds = this.brands
      .filter((b) => b.name.toLowerCase().includes(q))
      .map((b) => b.id);

    if (matchedBrandIds.length === 0) {
      // no matching brand → show empty list
      this.products = [];
    } else {
      // show products that belong to any matched brand
      this.products = this.allProducts.filter((p) =>
        matchedBrandIds.includes(p.brandId)
      );
      // if exactly one brand matched, set it as selected (visual)
      this.selectedBrandId =
        matchedBrandIds.length === 1 ? matchedBrandIds[0] : null;
    }
    this.cd.detectChanges();
  }

  // toggle show more brands
  toggleShowAll() {
    this.showAllBrands = !this.showAllBrands;
  }

  // helper: brands displayed in sidebar according to search + showAll flag
  get displayedBrands() {
    const q = (this.brandSearch || '').trim().toLowerCase();
    let list = this.brands.filter((b) => b.name.toLowerCase().includes(q));
    if (!this.showAllBrands) {
      list = list.slice(0, this.topLimit);
    }
    return list;
  }

  // optional: clear product filter
  clearBrandFilter() {
    this.brandSearch = '';
    this.search$.next('');
    this.filterByBrand(null);
  }

}
