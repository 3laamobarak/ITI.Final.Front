import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  AfterViewChecked,
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

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header implements OnInit, OnDestroy, AfterViewChecked {
  query = '';
  suggestions: { id: number; name: string }[] = [];
  categories: ICategory[] = [];
  cartCount = 0;
  showPanel = false;
  isLoading = false;

  openIndex: number | null = null;

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
    private cartService: CartServices
  ) {}

  ngOnInit(): void {
    // load categories (API + fallback)
    const s1 = this.categorySvc
      .getAllCategories()
      .pipe(catchError(() => of([])))
      .subscribe((cats) => {
        this.categories =
          cats && cats.length > 0
            ? cats
            : [
                {
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
                  name: 'Sports Nutrition',
                  subcategories: ['Protein & Powders', 'Creatine', 'Amino Acids'],
                },
                {
                  name: 'Personal Care',
                  subcategories: ['Skin Care', 'Hair Care', 'Bath & Body'],
                },
                {
                  name: 'Grocery',
                  subcategories: ['Snacks', 'Baking', 'Tea & Coffee'],
                },
                {
                  name: 'Baby & Kids',
                  subcategories: ['Baby Vitamins', 'Formulas', 'Diapers'],
                },
              ];
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

    // suggestions stream
    const s3 = this.search$
      .pipe(
        debounceTime(180),
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
            .pipe(catchError(() => of([])));
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
    this.showPanel = false;
    this.highlightedIndex = -1;
    this.cd.detectChanges();
  }

  onSearch(value?: string) {
    const term = ((value ?? this.query) || '').trim();
    if (!term) return;
    this.pushHistory(term);
    this.router.navigate(['productsList'], { queryParams: { search: term } });
    this.showPanel = false;
  }

  onSelectSuggestion(s: { id: number; name: string }) {
    if (!s) return;
    this.pushHistory(s.name);
    this.router.navigate(['productsList'], { queryParams: { search: s.name } });
    this.showPanel = false;
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
  @HostListener('document:click', ['$event'])
  onDocumentClick() {
    this.openIndex = null;
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
    this.openIndex = this.openIndex === index ? null : index;
  }
}
