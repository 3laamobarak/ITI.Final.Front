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
import { ICategory } from '../../Models/icategory';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit, OnDestroy, AfterViewChecked {
  query = '';
  suggestions: { id: number; name: string }[] = [];
  categories: ICategory[] = [];
  showPanel = false;
  isLoading = false;

  // داخل Header component class — الصق هذا
  openIndex: number | null = null; // يحفظ أي قائمة مفتوحة

  // فتح / غلق الـ mega panel عند الضغط على اسم الفئة
  openMega(index: number, ev?: Event) {
    ev?.stopPropagation(); // يمنع الـ document click من الإغلاق فورًا
    this.openIndex = this.openIndex === index ? null : index;
  }

  // إغلاق كل الميجا إذا ضغط المستخدم في أي مكان خارج القائمة
  @HostListener('document:click', ['$event'])
  onDocumentClick(ev?: Event) {
    this.openIndex = null;
  }

  // تعديل onSelectCategory لقبول subcategory اختيارية
  onSelectCategory(cat: ICategory, sub?: string) {
    const categoryQuery = sub ? `${cat.name} > ${sub}` : cat.name;
    // غيّري المسار إذا عندك route مختلف
    this.router.navigate(['productsList'], {
      queryParams: { category: categoryQuery },
    });
    this.openIndex = null;
  }

  // تأكدي أن onSelectTrending موجود (أو ضعي هذا إذا مش موجود)
  onSelectTrending(t: string) {
    this.router.navigate(['productsList'], { queryParams: { search: t } });
    this.openIndex = null;
  }

  trending: string[] = [
    'Vitamin C',
    'Calcium Magnesium Zinc',
    'Magnesium Malate',
    'B-Complex',
  ];

  historyKey = 'search_history_v1';
  searchHistory: string[] = [];
  // keyboard highlight index for suggestions
  highlightedIndex = -1;
  private search$ = new Subject<string>();
  private subs: Subscription[] = [];

  constructor(
    private productSvc: ProductServices,
    private categorySvc: CategoryServices,
    private cd: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    // load categories
    // attempt to load from API
    const s1 = this.categorySvc
      .getAllCategories()
      .pipe(catchError((_) => of([])))
      .subscribe((cats) => {
        // if API returned something non-empty use it, otherwise use static fallback
        // if (cats && cats.length > 0) {
        //   this.categories = cats;
        // } else {
        // static fallback
        this.categories = [
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
        // }

        this.cd.detectChanges();
      });
    this.subs.push(s1);

    // load history
    const saved = localStorage.getItem(this.historyKey);
    this.searchHistory = saved ? JSON.parse(saved) : [];

    // suggestions stream
    const s2 = this.search$
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
          // استخدمي endpoint حقيقي لو عندك؛ هذا يستدعي طريقة في ProductServices
          return this.productSvc
            .getSuggestionsClient(q)
            .pipe(catchError((_) => of([])));
        })
      )
      .subscribe((res: any[]) => {
        this.suggestions = (res || []).slice(0, 20);
        this.isLoading = false;
        this.showPanel = true;
        this.highlightedIndex = -1;
        this.cd.detectChanges();
      });
    this.subs.push(s2);
  }

  ngAfterViewChecked(): void {
    // بعدها كل تحديث نضمن أنه لو عنصر مظلل لازم نعمل scrollIntoView
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

  onInput(val: string) {
    this.query = val;
    this.search$.next(val);
  }

  onFocus() {
    // لو فيه نص سابق ولقينا اقتراحات نفتح، وإلا نفتح history
    this.showPanel = true;
  }

  // Keyboard handling on the input
  onKeyDown(event: KeyboardEvent) {
    if (!this.showPanel) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        // افتح لو مغلق
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
      // Enter: لو في highlighted اختاره، وإلا نفّذ البحث العام
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

  // Close panel (also used by overlay click)
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

  // onSelectTrending(t: string) {
  //   this.pushHistory(t);
  //   this.router.navigate(['productsList'], { queryParams: { search: t } });
  //   this.showPanel = false;
  // }

  // onSelectCategory(cat: ICategory) {
  //   this.router.navigate(['productsList'], {
  //     queryParams: { category: cat.name },
  //   });
  //   this.showPanel = false;
  // }

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

  // global Escape fallback (HostListener) — آمن لأننا نكست الـ type
  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent | Event) {
    const e = event as KeyboardEvent;
    if (e.key === 'Escape' && this.showPanel) {
      this.closePanel();
    }
  }
}
