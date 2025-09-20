import { Component, ElementRef, ViewChild, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { register } from 'swiper/element/bundle';
import { ICategory } from '../../../Models/icategory';
import { RouterLink } from '@angular/router';

register();

@Component({
  selector: 'app-category-slider',
  imports: [CommonModule, RouterLink],
  templateUrl: './cateory-slider.html',
  styleUrls: ['./cateory-slider.css'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CategorySlider implements AfterViewInit {

  @ViewChild('swiperContainer') swiperContainer!: ElementRef;
  @Input() categories: ICategory[] = [];

  // Dynamic icon mapping for categories with intelligent fallback system
  getCategoryIcon(categoryName: string): string {
    const iconMap: { [key: string]: string } = {
      'supplements': 'fa-pills',
      'vitamins': 'fa-capsules',
      'protein': 'fa-dumbbell',
      'sports': 'fa-running',
      'nutrition': 'fa-apple-alt',
      'wellness': 'fa-heart',
      'fitness': 'fa-dumbbell',
      'health': 'fa-heartbeat',
      'organic': 'fa-leaf',
      'natural': 'fa-seedling',
      'weight loss': 'fa-weight',
      'muscle': 'fa-dumbbell',
      'energy': 'fa-bolt',
      'immune': 'fa-shield-alt',
      'digestive': 'fa-stomach',
      'beauty': 'fa-spa',
      'skincare': 'fa-spa',
      'hair': 'fa-cut',
      'men': 'fa-male',
      'women': 'fa-female',
      'kids': 'fa-child',
      'elderly': 'fa-user-friends',
      'pregnancy': 'fa-baby',
      'lactation': 'fa-baby-carriage',
      'diabetes': 'fa-tint',
      'heart': 'fa-heart',
      'bone': 'fa-bone',
      'joint': 'fa-walking',
      'sleep': 'fa-bed',
      'stress': 'fa-brain',
      'anxiety': 'fa-brain',
      'depression': 'fa-brain',
      'memory': 'fa-brain',
      'focus': 'fa-eye',
      'concentration': 'fa-eye',
      'antioxidants': 'fa-shield-alt',
      'omega': 'fa-fish',
      'fish oil': 'fa-fish',
      'multivitamin': 'fa-capsules',
      'minerals': 'fa-gem',
      'calcium': 'fa-gem',
      'iron': 'fa-gem',
      'zinc': 'fa-gem',
      'magnesium': 'fa-gem',
      'potassium': 'fa-gem',
      'sodium': 'fa-gem',
      'vitamin c': 'fa-lemon',
      'vitamin d': 'fa-sun',
      'vitamin b': 'fa-bolt',
      'vitamin a': 'fa-eye',
      'vitamin e': 'fa-leaf',
      'vitamin k': 'fa-tint',
      'probiotics': 'fa-bacteria',
      'prebiotics': 'fa-seedling',
      'fiber': 'fa-seedling',
      'protein powder': 'fa-dumbbell',
      'whey': 'fa-dumbbell',
      'casein': 'fa-dumbbell',
      'creatine': 'fa-dumbbell',
      'bcaa': 'fa-dumbbell',
      'glutamine': 'fa-dumbbell',
      'collagen': 'fa-spa',
      'keratin': 'fa-cut',
      'biotin': 'fa-cut',
      'coenzyme q10': 'fa-heart',
      'resveratrol': 'fa-wine-glass',
      'curcumin': 'fa-pepper-hot',
      'green tea': 'fa-leaf',
      'ginkgo': 'fa-leaf',
      'ginseng': 'fa-leaf',
      'echinacea': 'fa-leaf',
      'turmeric': 'fa-pepper-hot',
      'ginger': 'fa-pepper-hot',
      'garlic': 'fa-pepper-hot',
      'cinnamon': 'fa-pepper-hot',
      'cayenne': 'fa-pepper-hot',
      'black pepper': 'fa-pepper-hot',
      'cayenne pepper': 'fa-pepper-hot',
      'chili': 'fa-pepper-hot',
      'paprika': 'fa-pepper-hot',
      'oregano': 'fa-leaf',
      'basil': 'fa-leaf',
      'thyme': 'fa-leaf',
      'rosemary': 'fa-leaf',
      'sage': 'fa-leaf',
      'mint': 'fa-leaf',
      'parsley': 'fa-leaf',
      'cilantro': 'fa-leaf',
      'dill': 'fa-leaf',
      'chives': 'fa-leaf',
      'tarragon': 'fa-leaf',
      'marjoram': 'fa-leaf',
      'bay leaves': 'fa-leaf',
      'laurel': 'fa-leaf',
      'fennel': 'fa-leaf',
      'anise': 'fa-leaf',
      'caraway': 'fa-leaf',
      'cumin': 'fa-leaf',
      'coriander': 'fa-leaf',
      'cardamom': 'fa-leaf',
      'cloves': 'fa-leaf',
      'nutmeg': 'fa-leaf',
      'allspice': 'fa-leaf',
      'star anise': 'fa-leaf',
      'vanilla': 'fa-leaf',
      'lavender': 'fa-leaf',
      'chamomile': 'fa-leaf',
      'hibiscus': 'fa-leaf',
      'rose': 'fa-leaf',
      'jasmine': 'fa-leaf',
      'elderflower': 'fa-leaf',
      'passionflower': 'fa-leaf',
      'valerian': 'fa-leaf',
      'kava': 'fa-leaf',
      'ashwagandha': 'fa-leaf',
      'rhodiola': 'fa-leaf',
      'maca': 'fa-leaf',
      'spirulina': 'fa-leaf',
      'chlorella': 'fa-leaf',
      'kelp': 'fa-leaf',
      'seaweed': 'fa-leaf',
      'algae': 'fa-leaf',
      'mushroom': 'fa-leaf',
      'reishi': 'fa-leaf',
      'shiitake': 'fa-leaf',
      'maitake': 'fa-leaf',
      'cordyceps': 'fa-leaf',
      'lion\'s mane': 'fa-leaf',
      'turkey tail': 'fa-leaf',
      'chaga': 'fa-leaf',
      'bee pollen': 'fa-leaf',
      'royal jelly': 'fa-leaf',
      'propolis': 'fa-leaf',
      'honey': 'fa-leaf',
      'manuka': 'fa-leaf',
      'acacia': 'fa-leaf',
      'clover': 'fa-leaf',
      'wildflower': 'fa-leaf',
      'buckwheat': 'fa-leaf',
      'orange blossom': 'fa-leaf',
      'lavender honey': 'fa-leaf',
      'eucalyptus': 'fa-leaf',
      'sage honey': 'fa-leaf',
      'thyme honey': 'fa-leaf',
      'rosemary honey': 'fa-leaf',
      'basil honey': 'fa-leaf',
      'oregano honey': 'fa-leaf',
      'mint honey': 'fa-leaf',
      'lemon balm': 'fa-leaf',
      'lemon verbena': 'fa-leaf',
      'lemon grass': 'fa-leaf',
      'lemon peel': 'fa-lemon',
      'orange peel': 'fa-lemon',
      'grapefruit': 'fa-lemon',
      'lime': 'fa-lemon',
      'bergamot': 'fa-lemon',
      'yuzu': 'fa-lemon',
      'kumquat': 'fa-lemon',
      'tangerine': 'fa-lemon',
      'mandarin': 'fa-lemon',
      'clementine': 'fa-lemon',
      'satsuma': 'fa-lemon',
      'pomelo': 'fa-lemon',
      'ugli': 'fa-lemon',
      'citron': 'fa-lemon',
      'buddha\'s hand': 'fa-lemon',
      'finger lime': 'fa-lemon',
      'blood orange': 'fa-lemon',
      'cara cara': 'fa-lemon',
      'navel': 'fa-lemon',
      'valencia': 'fa-lemon',
      'seville': 'fa-lemon',
      'moro': 'fa-lemon',
      'tarocco': 'fa-lemon',
      'sanguinello': 'fa-lemon',
      'maltaise': 'fa-lemon',
      'jaffa': 'fa-lemon',
      'shamouti': 'fa-lemon',
      'temple': 'fa-lemon',
      'tangelo': 'fa-lemon',
      'minneola': 'fa-lemon',
      'orlando': 'fa-lemon',
      'wekiwa': 'fa-lemon',
      'seminole': 'fa-lemon',
      'thornton': 'fa-lemon',
      'ugli fruit': 'fa-lemon'
    };

    // Dynamic fallback icons array - 6 additional icons that rotate based on category name
    const dynamicFallbackIcons = [
      'fa-star',      // General/Featured
      'fa-gem',       // Premium/Quality
      'fa-fire',      // Popular/Trending
      'fa-magic',     // Special/Unique
      'fa-crown',     // Premium/Elite
      'fa-rocket'     // New/Innovative
    ];

    // Convert category name to lowercase and search for exact match or partial match
    const lowerName = categoryName.toLowerCase().trim();
    
    // First try exact match
    if (iconMap[lowerName]) {
      return iconMap[lowerName];
    }
    
    // Then try partial matches
    for (const key in iconMap) {
      if (lowerName.includes(key) || key.includes(lowerName)) {
        return iconMap[key];
      }
    }
    
    // Dynamic fallback: Use category name to determine which of the 6 fallback icons to use
    // This ensures the same category always gets the same icon, but different categories get different icons
    const categoryHash = this.hashString(categoryName);
    const iconIndex = categoryHash % dynamicFallbackIcons.length;
    
    return dynamicFallbackIcons[iconIndex];
  }

  // Helper method to create a consistent hash from category name
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  swiperParams = {
    slidesPerView: 6,
    spaceBetween: 20,
    navigation: false,
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
        spaceBetween: 20
      },
      992: {
        slidesPerView: 6,
        spaceBetween: 20
      }
    }
  };

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
