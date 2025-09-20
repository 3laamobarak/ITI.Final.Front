import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IProduct } from '../../../Models/iproduct';
import { ActivatedRoute } from '@angular/router';
import { ProductServices } from '../../../Services/product-services';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductSlider } from '../product-slider/product-slider';
import {CartServices} from '../../../Services/cart-services';
import { ReviewService } from '../../../Services/review-service';
import { IReview, CreateReviewDto } from '../../../Models/ireview';

@Component({
  selector: 'app-product-details',
  imports: [CommonModule, FormsModule, ProductSlider],
  templateUrl: './product-details.html',
  styleUrls: ['./product-details.css'],
})
export class ProductDetails implements OnInit {
  productsAlsoViewed: IProduct[] = [];
  recommendedProducts: IProduct[] = [];
  loadingRecommended = false;
  product: IProduct | null = null;
  loading = true;
  qty = 1;
  activeImageIndex = 0;
  galleryImages: string[] = [];
  activeTab = 'overview';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductServices,
    private cd: ChangeDetectorRef,
    private cartService: CartServices,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    // Debug localStorage
    console.log('All localStorage items:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        console.log(`${key}:`, localStorage.getItem(key));
      }
    }

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      this.productService.getProductById(id).subscribe({
        next: (data) => {
          console.log('Product loaded:', data);
          this.product = data;

          this.galleryImages = [
           
            'https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/now/now00035/g/32.jpg',
              ...(data.imageUrl ? [data.imageUrl] : []), 
            'https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/now/now00035/s/43.jpg',
            'https://cloudinary.images-iherb.com/image/upload/w_75/f_auto,q_auto:eco/images/cms/banners/dPDP_Authenticity_Graphic2_2025_009en-us.jpg',
            'https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/now/now00035/s/38.jpg',
          ];

          this.activeImageIndex = 0;
          this.loading = false;
          this.cd.detectChanges(); 

          // Load reviews once product is available
          this.loadReviews();
          
          // Log product data for debugging
          console.log('Product rating data:', {
            averageRating: data.averageRating,
            reviews: data.reviews,
            reviewCount: data.reviewCount
          });
        },
        error: (err) => {
          console.error('Error loading product:', err);
          this.loading = false;
        },
      });
    }

    
    this.loadingRecommended = true;
    this.productService.getAllProducts().subscribe((data) => {
      
      if (this.product){
        // Products from different brands (also viewed)
        this.productsAlsoViewed = data
          .filter((p) => p.brandId !== this.product?.brandId && p.id !== this.product?.id)
          .slice(0, 10);
        
        // Recommended products from same brand or similar products
        this.recommendedProducts = data
          .filter((p) => p.brandId === this.product?.brandId && p.id !== this.product?.id)
          .slice(0, 8);
        
        // If no products from same brand, show random products
        if (this.recommendedProducts.length === 0) {
          this.recommendedProducts = data
            .filter((p) => p.id !== this.product?.id)
            .slice(0, 8);
        }
      }
      else{
        this.productsAlsoViewed = data.slice(0, 10);
        this.recommendedProducts = data.slice(0, 8);
      }
     
      this.loadingRecommended = false;
      this.cd.detectChanges();
    });
  }

  increaseQty() {
    this.qty++;
  }
  decreaseQty() {
    if (this.qty > 1) this.qty--;
  }
  addToCart(product: IProduct, qty: number) {
this.cartService.addToCart(this.product!.id, qty).subscribe({
  next: () => {
    console.log(`${this.product!.name} has been added to the cart `);
  },
  error: (err) => {
    console.error('Failed to add the product to the cart', err);
  }
});

  }

  getStars(rating: number): string {
    let fullStars = Math.floor(rating);
    let halfStar = rating % 1 >= 0.5 ? 1 : 0;
    let emptyStars = 5 - fullStars - halfStar;

    // Determine color based on rating
    let color = this.getStarColor(rating);

    let starsHtml = '';
    for (let i = 0; i < fullStars; i++) {
      starsHtml += `<i class="bi bi-star-fill" style="color: ${color}"></i>`;
    }
    if (halfStar) {
      starsHtml += `<i class="bi bi-star-half" style="color: ${color}"></i>`;
    }
    for (let i = 0; i < emptyStars; i++) {
      starsHtml += `<i class="bi bi-star" style="color: #6c757d"></i>`;
    }
    return starsHtml;
  }

  getStarColor(rating: number): string {
    if (rating >= 4.5) return '#28a745'; // Green for excellent (4.5-5.0)
    if (rating >= 4.0) return '#007bff'; // Blue for very good (4.0-4.4)
    if (rating >= 3.5) return '#17a2b8'; // Light blue for good (3.5-3.9)
    if (rating >= 3.0) return '#ffc107'; // Yellow for average (3.0-3.4)
    if (rating >= 2.0) return '#fd7e14'; // Orange for below average (2.0-2.9)
    return '#dc3545';                     // Red for poor (0-1.9)
  }

  // ================= Reviews =================
  reviews: IReview[] = [];
  filteredReviews: IReview[] = [];
  page = 1;
  pageSize = 5;
  sortOption: 'newest' | 'highest' | 'lowest' = 'newest';
  starFilter: 0 | 1 | 2 | 3 | 4 | 5 = 0; // 0 = all
  loadingReviews = false;
  submittingReview = false;
  reviewError: string | null = null;
  reviewSuccess: string | null = null;
  reviewForm: CreateReviewDto = { rating: 0, comment: '' };
  get isLoggedIn(): boolean {
    const possibleTokenKeys = [
      'auth_token', 'token', 'jwt_token', 'access_token', 
      'User_Token', 'user_token', 'userToken'
    ];
    
    return possibleTokenKeys.some(key => !!localStorage.getItem(key));
  }

  getCurrentUserId(): string | null {
    // Check all possible localStorage keys for user data
    const possibleKeys = [
      'User_Token', 'user_token', 'userToken', 'user_Token',
      'user_data', 'userData', 'user', 'currentUser', 'auth_user',
      'auth_token', 'token', 'jwt_token', 'access_token'
    ];
    
    for (const key of possibleKeys) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          // Try to parse as JSON first
          const parsed = JSON.parse(value);
          
          // Check for user ID in various possible fields
          const userId = parsed.id || parsed.userId || parsed.sub || parsed.user_id || 
                        parsed.Id || parsed.UserId || parsed.Sub || parsed.User_Id ||
                        parsed.nameid || parsed.NameId || parsed.nameId;
          
          if (userId) {
            console.log(`Found user ID in ${key}:`, userId);
            return String(userId); // Ensure it's a string
          }
        } catch (e) {
          // If not JSON, might be a JWT token
          if (value.includes('.')) {
            try {
              const payload = JSON.parse(atob(value.split('.')[1]));
              
              const userId = payload.sub || payload.userId || payload.id || payload.nameid || 
                            payload.Sub || payload.UserId || payload.Id || payload.NameId;
              
              if (userId) {
                console.log(`Found user ID in JWT from ${key}:`, userId);
                return String(userId); // Ensure it's a string
              }
            } catch (jwtError) {
              // Silently continue to next key
              continue;
            }
          }
        }
      }
    }
    
    console.log('No user ID found in any localStorage key');
    return null;
  }

  canDeleteReview(review: IReview): boolean {
    if (!this.isLoggedIn) return false;
    
    const currentUserId = this.getCurrentUserId();
    
    // If we can't get the current user ID, don't allow deletion
    if (!currentUserId) {
      console.log('Cannot determine current user ID - deletion not allowed');
      return false;
    }
    
    // If the review doesn't have a userId, don't allow deletion
    if (!review.userId) {
      console.log('Review has no userId - deletion not allowed');
      return false;
    }
    
    // Only allow deletion if the current user ID matches the review's user ID
    const canDelete = review.userId === currentUserId;
    console.log(`Review deletion check: CurrentUser=${currentUserId}, ReviewUser=${review.userId}, CanDelete=${canDelete}`);
    
    return canDelete;
  }

  hasUserReviewed(): boolean {
    if (!this.isLoggedIn || !this.reviews.length) return false;
    
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) return false;
    
    return this.reviews.some(review => review.userId === currentUserId);
  }

  getUserReview(): IReview | null {
    if (!this.isLoggedIn || !this.reviews.length) return null;
    
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) return null;
    
    return this.reviews.find(review => review.userId === currentUserId) || null;
  }

  loadReviews(): void {
    if (!this.product) return;
    this.loadingReviews = true;
    this.reviewService.getProductReviews(this.product.id).subscribe({
      next: (list) => {
        // Map the response to handle both PascalCase and camelCase
        this.reviews = (list || []).map((review: any) => ({
          id: review.id,
          productId: review.productId,
          userId: review.userId || review.UserId, // Handle both cases
          userName: review.userName || review.UserName,
          rating: review.rating || review.Rating,
          comment: review.comment || review.Comment,
          createdAt: review.createdAt || review.CreatedAt
        })).sort((a, b) => {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return db - da;
        });
        
        // Debug logging
        console.log('Loaded reviews with mapping:', this.reviews.map(r => ({
          id: r.id,
          userId: r.userId,
          userName: r.userName,
          canDelete: this.canDeleteReview(r)
        })));
        console.log('Current user ID:', this.getCurrentUserId());
        
        this.applyFilters();
        this.loadingReviews = false;
        this.cd.detectChanges();
        
        // Update product review count if it doesn't match
        if (this.product && this.reviews.length !== (this.product.reviews || 0)) {
          this.product.reviews = this.reviews.length;
          this.cd.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
        this.loadingReviews = false;
      }
    });
  }

  setRating(value: number): void {
    this.reviewForm.rating = value;
  }

  submitReview(): void {
    if (!this.product || this.submittingReview) return;
    
    // Check if user already has a review for this product
    if (this.hasUserReviewed()) {
      this.reviewError = 'You have already reviewed this product. You can only submit one review per product.';
      return;
    }
    
    if (this.reviewForm.rating < 1 || this.reviewForm.rating > 5) {
      this.reviewError = 'Please select a rating.';
      return;
    }
    if (!this.reviewForm.comment || this.reviewForm.comment.trim().length < 3) {
      this.reviewError = 'Please write a short comment.';
      return;
    }
    this.reviewError = null;
    this.reviewSuccess = null;
    this.submittingReview = true;
    this.reviewService.addReview(this.product.id, this.reviewForm).subscribe({
      next: () => {
        this.submittingReview = false;
        this.reviewForm = { rating: 0, comment: '' };
        this.reviewSuccess = 'Thank you for your review!';
        this.loadReviews();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.reviewSuccess = null;
          this.cd.detectChanges();
        }, 3000);
        
        // Reload product to get updated rating
        this.productService.getProductById(this.product!.id).subscribe({
          next: (updatedProduct) => {
            this.product!.averageRating = updatedProduct.averageRating;
            this.product!.reviews = updatedProduct.reviews;
            this.cd.detectChanges();
          }
        });
      },
      error: (err) => {
        this.submittingReview = false;
        if (err?.error?.includes('already reviewed')) {
          this.reviewError = 'You have already reviewed this product. You can only submit one review per product.';
        } else {
        this.reviewError = err?.error || 'Failed to submit review. Please try again.';
        }
      }
    });
  }

  deleteReview(reviewId: number): void {
    const review = this.reviews.find(r => r.id === reviewId);
    if (!review) {
      console.error('Review not found');
      return;
    }

    // Double-check that the user can delete this review
    if (!this.canDeleteReview(review)) {
      console.error('User is not authorized to delete this review');
      return;
    }

    const confirmed = confirm('Are you sure you want to delete your review? This action cannot be undone.');
    if (!confirmed) return;

    this.reviewService.deleteReview(reviewId).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(r => r.id !== reviewId);
        this.applyFilters();
        this.cd.detectChanges();
        
        // Show success message
        this.reviewSuccess = 'Your review has been deleted successfully.';
        setTimeout(() => {
          this.reviewSuccess = null;
          this.cd.detectChanges();
        }, 3000);
        
        // Reload product to get updated rating
        if (this.product) {
          this.productService.getProductById(this.product.id).subscribe({
            next: (updatedProduct) => {
              this.product!.averageRating = updatedProduct.averageRating;
              this.product!.reviews = updatedProduct.reviews;
              this.cd.detectChanges();
            }
          });
        }
      },
      error: (err) => {
        console.error('Error deleting review:', err);
        this.reviewError = 'Failed to delete your review. Please try again.';
        setTimeout(() => {
          this.reviewError = null;
          this.cd.detectChanges();
        }, 3000);
      }
    });
  }

  deleteUserReview(): void {
    const userReview = this.getUserReview();
    if (!userReview) return;
    
    if (!confirm('Are you sure you want to delete your review? This action cannot be undone.')) return;
    
    this.reviewService.deleteReview(userReview.id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(r => r.id !== userReview.id);
        this.applyFilters();
        this.cd.detectChanges();
        
        // Show success message
        this.reviewSuccess = 'Your review has been deleted successfully.';
        setTimeout(() => {
          this.reviewSuccess = null;
          this.cd.detectChanges();
        }, 3000);
        
        // Reload product to get updated rating
        if (this.product) {
          this.productService.getProductById(this.product.id).subscribe({
            next: (updatedProduct) => {
              this.product!.averageRating = updatedProduct.averageRating;
              this.product!.reviews = updatedProduct.reviews;
              this.cd.detectChanges();
            }
          });
        }
      },
      error: (err) => {
        console.error('Error deleting user review:', err);
        this.reviewError = 'Failed to delete your review. Please try again.';
      }
    });
  }

  // ---------- Sorting/Filtering/Pagination ----------
  applyFilters(): void {
    let list = [...this.reviews];
    if (this.starFilter) {
      list = list.filter(r => r.rating === this.starFilter);
    }
    if (this.sortOption === 'newest') {
      list.sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      });
    } else if (this.sortOption === 'highest') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (this.sortOption === 'lowest') {
      list.sort((a, b) => a.rating - b.rating);
    }
    this.filteredReviews = list;
    this.page = 1;
  }

  changeSort(option: 'newest' | 'highest' | 'lowest'): void {
    this.sortOption = option;
    this.applyFilters();
  }

  setStarFilter(stars: 0 | 1 | 2 | 3 | 4 | 5): void {
    this.starFilter = stars;
    this.applyFilters();
  }

  get pagedReviews(): IReview[] {
    return this.filteredReviews.slice(0, this.page * this.pageSize);
  }

  canLoadMore(): boolean {
    return this.pagedReviews.length < this.filteredReviews.length;
  }

  loadMore(): void {
    if (this.canLoadMore()) this.page++;
  }

  // ---------- Rating breakdown ----------
  get ratingBreakdown(): { star: number; count: number; pct: number }[] {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of this.reviews) counts[r.rating as 1|2|3|4|5]++;
    const total = this.reviews.length || 1;
    return [5,4,3,2,1].map(star => ({ star, count: counts[star], pct: (counts[star] / total) * 100 }));
  }

  // Get rating summary text
  getRatingSummary(): string {
    const rating = this.product?.averageRating || 0;
    const count = this.product?.reviews || 0;
    
    if (count === 0) return 'No ratings yet';
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4.0) return 'Very Good';
    if (rating >= 3.5) return 'Good';
    if (rating >= 3.0) return 'Average';
    if (rating >= 2.0) return 'Below Average';
    return 'Poor';
  }

  // Get rating insights
  getRatingInsights(): string[] {
    const rating = this.product?.averageRating || 0;
    const count = this.product?.reviews || 0;
    const insights: string[] = [];

    if (count === 0) {
      insights.push('Be the first to review this product');
      return insights;
    }

    if (rating >= 4.5) {
      insights.push('Highly recommended by customers');
      insights.push('Outstanding quality and value');
    } else if (rating >= 4.0) {
      insights.push('Well-received by customers');
      insights.push('Good quality and satisfaction');
    } else if (rating >= 3.5) {
      insights.push('Generally positive feedback');
      insights.push('Good value for money');
    } else if (rating >= 3.0) {
      insights.push('Mixed customer opinions');
      insights.push('Consider reading reviews');
    } else {
      insights.push('Customer concerns noted');
      insights.push('Read reviews before purchasing');
    }

    if (count >= 50) {
      insights.push('Based on ' + count + ' customer reviews');
    } else if (count >= 10) {
      insights.push('Based on ' + count + ' customer reviews');
    }

    return insights;
  }

  // Get rating color class
  getRatingColorClass(): string {
    const rating = this.product?.averageRating || 0;
    if (rating >= 4.5) return 'rating-excellent';
    if (rating >= 4.0) return 'rating-very-good';
    if (rating >= 3.5) return 'rating-good';
    if (rating >= 3.0) return 'rating-average';
    if (rating >= 2.0) return 'rating-below-average';
    return 'rating-poor';
  }

  // ---------- Helpful votes (client-side) ----------
  private helpfulKey(id: number): string { return `review_helpful_${id}`; }

  getHelpfulCount(id: number): number {
    const raw = localStorage.getItem(this.helpfulKey(id));
    return raw ? Number(raw) || 0 : 0;
  }

  hasVotedHelpful(id: number): boolean {
    return localStorage.getItem(this.helpfulKey(id) + '_v') === '1';
  }

  markHelpful(id: number): void {
    if (this.hasVotedHelpful(id)) return;
    const count = this.getHelpfulCount(id) + 1;
    localStorage.setItem(this.helpfulKey(id), String(count));
    localStorage.setItem(this.helpfulKey(id) + '_v', '1');
  }

  // ---------- Navigation ----------
  scrollToSection(sectionId: string): void {
    this.activeTab = sectionId;
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  addToWishlist(product: IProduct): void {
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    let exists = wishlist.find((item: any) => item.id === product.id);

    if (!exists) {
      wishlist.push(product);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      console.log('Product added to wishlist');
    } else {
      console.log('Product already exists in wishlist');
    }
  }

  // Get rating comparison with category average
  getRatingComparison(): string {
    const rating = this.product?.averageRating || 0;
    if (rating >= 4.5) return 'Above average for this category';
    if (rating >= 4.0) return 'Above average for this category';
    if (rating >= 3.5) return 'Average for this category';
    if (rating >= 3.0) return 'Below average for this category';
    return 'Below average for this category';
  }

  // Get rating trend (if we had historical data)
  getRatingTrend(): string {
    const count = this.product?.reviews || 0;
    if (count >= 50) return 'Highly reviewed product';
    if (count >= 20) return 'Well-reviewed product';
    if (count >= 10) return 'Moderately reviewed product';
    if (count >= 5) return 'Few reviews available';
    return 'Limited reviews available';
  }
}


