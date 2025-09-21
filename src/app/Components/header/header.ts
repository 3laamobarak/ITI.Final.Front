import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  AfterViewChecked,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subject, Subscription, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
} from 'rxjs/operators';
import { ProductServices } from '../../Services/product-services';
import { CategoryServices } from '../../Services/category-services';
import { CartServices } from '../../Services/cart-services';
import { ICategory } from '../../Models/icategory';
import { User } from '../../Services/user';


@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('searchInput') searchInputElement!: ElementRef;
  
  query = '';
  suggestions: { id: number; name: string }[] = [];
  categories: ICategory[] = [];
  cartCount = 0;
  showPanel = false;
  isLoading = false;
  isLoggedIn = false;
  showProfileMenu = false;
  userName = '';
  isMobile = false;
  recentSearches: string[] = [];

  openIndex: number | null = null;
  categoryProducts: any[] = [];
  loadingProducts = false;

  trending: string[] = [
    'Vitamin C',
    'Calcium Magnesium Zinc',
    'Magnesium Malate',
    'B-Complex',
  ];

  historyKey = 'search_history_v1';
  searchHistory: string[] = [];
  highlightedIndex = -1;

  private search$ = new Subject<string>();
  private subs: Subscription[] = [];


  constructor(
    private productSvc: ProductServices,
    private categorySvc: CategoryServices,
    private cd: ChangeDetectorRef,
    private router: Router,
    private cartService: CartServices,
    private userService: User,

  ) {}

  ngOnInit(): void {
    this.checkLoginStatus();    
    // load categories (API + fallback)
    const s1 = this.categorySvc
      .getAllCategories()
      .pipe(catchError((error) => {
        console.error('Error fetching categories:', error);
        return of([]);
      }))
      .subscribe((cats) => {
        console.log('Categories from API:', cats);
        this.categories =
          cats && cats.length > 0
            ? cats
            : [
                {
                  id: 1,
                  name: 'Supplements',
                  subcategories: [
                    'Vitamins',
                    'Minerals',
                    'Antioxidants',
                    'Herbs',
                    'Fish Oils & Omegas',
                  ],
                },
                {
                  id: 2,
                  name: 'Sports Nutrition',
                  subcategories: ['Protein & Powders', 'Creatine', 'Amino Acids'],
                },
                {
                  id: 3,
                  name: 'Personal Care',
                  subcategories: ['Skin Care', 'Hair Care', 'Bath & Body'],
                },
                {
                  id: 4,
                  name: 'Grocery',
                  subcategories: ['Snacks', 'Baking', 'Tea & Coffee'],
                },
                {
                  id: 5,
                  name: 'Baby & Kids',
                  subcategories: ['Baby Vitamins', 'Formulas', 'Diapers'],
                },
              ];
        console.log('Final categories:', this.categories);
        this.cd.detectChanges();
      });
    this.subs.push(s1);

    // load cart count
    const s2 = this.cartService.getCartCount().subscribe((count) => {
      this.cartCount = count;
      this.cd.detectChanges();
    });
    this.subs.push(s2);

    // load search history
    const saved = localStorage.getItem(this.historyKey);
    this.searchHistory = saved ? JSON.parse(saved) : [];
    
    // Get recent searches for quick access
    this.recentSearches = this.searchHistory.slice(0, 3);

    // suggestions stream with improved error handling and loading states
    const s3 = this.search$
      .pipe(
        debounceTime(300), // Increased debounce time for better performance
        distinctUntilChanged(),
        switchMap((term) => {
          const q = (term || '').trim();
          if (!q) {
            this.isLoading = false;
            this.suggestions = [];
            this.highlightedIndex = -1;
            return of([]);
          }
          this.isLoading = true;
          return this.productSvc
            .getSuggestionsClient(q)
            .pipe(
              catchError((error) => {
                console.error('Error fetching suggestions:', error);
                return of([]);
              })
            );
        })
      )
      .subscribe((res: any[]) => {
        this.suggestions = (res || []).slice(0, 20);
        this.isLoading = false;
        this.showPanel = true;
        this.highlightedIndex = -1;
        this.cd.detectChanges();
      });
    this.subs.push(s3);
  }



  // Focus search input
  focusSearch() {
    if (this.searchInputElement) {
      this.searchInputElement.nativeElement.focus();
    }
  }

  // Clear search input
  clearSearch() {
    this.query = '';
    this.suggestions = [];
    this.showPanel = false;
    this.cd.detectChanges();
    this.focusSearch();
  }

  // Check if user is logged in
  checkLoginStatus() {
    this.isLoggedIn = this.userService.isLoggedIn();
    if (this.isLoggedIn) {
      this.userName = localStorage.getItem(this.userService.TokenUser) || 'User';
    } else {
      this.isLoggedIn = false;
      this.userName = '';
    }
  }

  // Toggle profile menu
  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.showProfileMenu = !this.showProfileMenu;
  }

  // Logout function
  logout() {
    this.userService.logout();
    localStorage.removeItem(this.userService.TokenUser);
    this.isLoggedIn = false;
    this.showProfileMenu = false;
    this.router.navigate(['/login-register']);
  }

  // Close profile menu when clicking outside
  @HostListener('document:click')
  closeProfileMenu() {
    this.showProfileMenu = false;
  }

  ngAfterViewChecked(): void {
    if (this.highlightedIndex >= 0) {
      const el = document.getElementById(`sug-${this.highlightedIndex}`);
      if (el) {
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  // 🔍 Search handling
  onInput(val: string) {
    this.query = val;
    this.search$.next(val);
  }

  onFocus() {
    this.showPanel = true;
  }

  onKeyDown(event: KeyboardEvent) {
    if (!this.showPanel) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        this.showPanel = true;
      }
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!this.suggestions.length) return;
      this.highlightedIndex =
        (this.highlightedIndex + 1) % this.suggestions.length;
      this.cd.detectChanges();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!this.suggestions.length) return;
      this.highlightedIndex =
        (this.highlightedIndex - 1 + this.suggestions.length) %
        this.suggestions.length;
      this.cd.detectChanges();
    } else if (event.key === 'Enter') {
      if (
        this.highlightedIndex >= 0 &&
        this.suggestions[this.highlightedIndex]
      ) {
        this.onSelectSuggestion(this.suggestions[this.highlightedIndex]);
        event.preventDefault();
      } else {
        this.onSearch();
      }
    } else if (event.key === 'Escape') {
      this.closePanel();
    }
  }

  closePanel() {
    setTimeout(() => {
      this.showPanel = false;
      this.highlightedIndex = -1;
      this.cd.detectChanges();
    }, 150); // Small delay to allow click events to register
  }

  onSearch(value?: string) {
    const term = ((value ?? this.query) || '').trim();
    if (!term) return;
    this.pushHistory(term);
    this.router.navigate(['productsList'], { queryParams: { search: term } });
    this.showPanel = false;
    
    // Update recent searches
    this.recentSearches = this.searchHistory.slice(0, 3);
  }

  onSelectSuggestion(s: { id: number; name: string }) {
    if (!s) return;
    this.pushHistory(s.name);
    this.query = s.name; // Update input field with selected suggestion
    this.router.navigate(['productsList'], { queryParams: { search: s.name } });
    this.showPanel = false;
    
    // Update recent searches
    this.recentSearches = this.searchHistory.slice(0, 3);
  }

  onSelectCategory(cat: ICategory, sub?: string) {
    const categoryQuery = sub ? `${cat.name} > ${sub}` : cat.name;
    this.router.navigate(['productsList'], {
      queryParams: { category: categoryQuery },
    });
    this.openIndex = null;
  }

  onSelectTrending(t: string) {
    this.router.navigate(['productsList'], { queryParams: { search: t } });
    this.openIndex = null;
  }

  // History
  pushHistory(term: string) {
    const t = term.trim();
    if (!t) return;
    this.searchHistory = this.searchHistory.filter(
      (x) => x.toLowerCase() !== t.toLowerCase()
    );
    this.searchHistory.unshift(t);
    if (this.searchHistory.length > 10) this.searchHistory.length = 10;
    localStorage.setItem(this.historyKey, JSON.stringify(this.searchHistory));
  }

  clearHistory() {
    this.searchHistory = [];
    localStorage.removeItem(this.historyKey);
    this.cd.detectChanges();
  }

  removeHistoryItem(i: number) {
    this.searchHistory.splice(i, 1);
    localStorage.setItem(this.historyKey, JSON.stringify(this.searchHistory));
    this.cd.detectChanges();
  }

  // Close mega menu if click outside
  @HostListener('document:click', [])
  onDocumentClick() {
    this.openIndex = null;
    this.categoryProducts = [];
  }

  // Handle product selection from mega menu
  onSelectProduct(product: any) {
    this.router.navigate(['/product', product.id]);
    this.openIndex = null;
    this.categoryProducts = [];
  }

  // Escape closes panel
  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent | Event) {
    const e = event as KeyboardEvent;
    if (e.key === 'Escape' && this.showPanel) {
      this.closePanel();
    }
  }

  // Toggle mega panel
  openMega(index: number, ev?: Event) {
    ev?.stopPropagation();
    if (this.openIndex === index) {
      this.openIndex = null;
      this.categoryProducts = [];
    } else {
      this.openIndex = index;
      this.loadCategoryProducts(index);
    }
  }

  // Load products for the selected category
  loadCategoryProducts(categoryIndex: number) {
    if (categoryIndex >= 0 && categoryIndex < this.categories.length) {
      const category = this.categories[categoryIndex];
      this.loadingProducts = true;
      
      console.log('Loading products for category:', category);
      
      // Try to use category ID if available, otherwise fallback to filtering
      if (category.id) {
        this.categorySvc.getCategoryProducts(category.id)
          .pipe(catchError((error) => {
            console.error('Error fetching category products:', error);
            return of([]);
          }))
          .subscribe((products: any[]) => {
            console.log('Products from API:', products);
            this.categoryProducts = products.slice(0, 8);
            this.loadingProducts = false;
            this.cd.detectChanges();
          });
      } else {
        // Fallback: Get products by category name
        this.productSvc.getProductsByCategoryName(category.name)
          .pipe(catchError((error) => {
            console.error('Error fetching products by category name:', error);
            return of([]);
          }))
          .subscribe((products: any[]) => {
            console.log('Products by category name:', products);
            this.categoryProducts = products.slice(0, 8);
            this.loadingProducts = false;
            this.cd.detectChanges();
          });
      }
    }
  }

  // Handle special filter navigation
  onSpecialFilter(filterType: string) {
    let queryParams: any = {};
    
    switch(filterType) {
      case 'specials':
        queryParams = { special: 'discount' };
        break;
      case 'best-sellers':
        queryParams = { sort: 'popularity' };
        break;
      case 'try':
        queryParams = { tag: 'sample' };
        break;
      case 'new':
        queryParams = { sort: 'newest' };
        break;
      case 'wellness':
        queryParams = { category: 'Wellness' };
        break;
    }
    
    this.router.navigate(['productsList'], { queryParams });
  }

  // Get appropriate icon for category
  getCategoryIcon(categoryName: string): string {
    const iconMap: { [key: string]: string } = {
      'Supplements': 'fas fa-pills',
      'Sports Nutrition': 'fas fa-dumbbell',
      'Personal Care': 'fas fa-spa',
      'Grocery': 'fas fa-shopping-basket',
      'Baby & Kids': 'fas fa-baby',
      'Vitamins': 'fas fa-pills',
      'Minerals': 'fas fa-gem',
      'Antioxidants': 'fas fa-leaf',
      'Herbs': 'fas fa-seedling',
      'Fish Oils & Omegas': 'fas fa-fish',
      'Protein & Powders': 'fas fa-dumbbell',
      'Creatine': 'fas fa-fire',
      'Amino Acids': 'fas fa-atom',
      'Skin Care': 'fas fa-hand-sparkles',
      'Hair Care': 'fas fa-cut',
      'Bath & Body': 'fas fa-bath',
      'Snacks': 'fas fa-cookie-bite',
      'Baking': 'fas fa-birthday-cake',
      'Tea & Coffee': 'fas fa-coffee',
      'Baby Vitamins': 'fas fa-baby',
      'Formulas': 'fas fa-baby-carriage',
      'Diapers': 'fas fa-baby'
    };
    
    return iconMap[categoryName] || 'fas fa-tags';
  }
}

