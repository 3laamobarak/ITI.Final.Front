import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProfileService } from '../../Services/profile.service';
import { ProductServices } from '../../Services/product-services';
import { CartServices } from '../../Services/cart-services';
import { Refund } from '../../Services/refund.service';
import { IUserProfile, IOrder, IReward, IMessage } from '../../Models/IUserProfile';
import { IProduct } from '../../Models/iproduct';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  @ViewChild('productList', { static: false }) productList!: ElementRef;
  
  userProfile: IUserProfile | null = null;
  userOrders: IOrder[] = [];
  userRewards: IReward | null = {
    availableRewards: 0.00,
    rewardsCode: 'OHK3181',
    ruleUpdated: true
  };
  userMessages: IMessage[] = [];
  recommendedProducts: IProduct[] = [];
  unreadMessagesCount = 0;
  isLoading = true;
  userRefunds: Refund[] = [];
  userReviews: any[] = [];
  userCategories: any[] = [];
  userBrands: any[] = [];
  userChatMessages: any[] = [];
  otpStatus: any = null;
  cartItems: any[] = [];
  
  // Product cache for order items
  productCache: Map<number, IProduct> = new Map();

  // Review editing properties
  editingReview: any = null;
  reviewForm!: FormGroup;
  isEditingReview = false;

  // Refund properties
  refundForm!: FormGroup;
  isCreatingRefund = false;
  selectedOrderForRefund: IOrder | null = null;

  // Profile editing form
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  emailForm!: FormGroup;
  isEditingProfile = false;
  isEditingPassword = false;
  isEditingEmail = false;
  isSaving = false;
  saveMessage = '';
  saveMessageType = '';

  // Navigation items - Match Image Structure
  navigationItems = [
    {
      section: 'My Account',
      items: [
        { name: 'Dashboard', route: '/profile', active: true, icon: 'bi-house', badge: null },
        { name: 'Orders', route: '/profile', active: false, icon: 'bi-bag', badge: null },
        { name: 'Cart', route: '/profile', active: false, icon: 'bi-cart', badge: null },
        { name: 'Profile Settings', route: '/profile', active: false, icon: 'bi-gear', badge: null },
        { name: 'Messages', route: '/profile/messages', active: false, icon: 'bi-envelope', badge: 1 },
        { name: 'Account Information', route: '/profile/account', active: false, icon: 'bi-person', badge: null },
        { name: 'Address Book', route: '/profile/addresses', active: false, icon: 'bi-geo-alt', badge: null },
        { name: 'Payment Methods', route: '/profile/payment', active: false, icon: 'bi-credit-card', badge: null },
        { name: 'My Lists', route: '/profile/lists', active: false, icon: 'bi-heart', badge: null }
      ]
    },
    {
      section: 'Credits & Savings',
      items: [
        { name: 'My Rewards', route: '/profile/rewards', active: false, icon: 'bi-gift', badge: null },
        { name: 'Store Credits', route: '/profile/credits', active: false, icon: 'bi-wallet', badge: null },
        { name: 'Sales & Offers', route: '/profile/offers', active: false, icon: 'bi-percent', badge: null }
      ]
    },
    {
      section: 'My Activity',
      items: [
        { name: 'My Page', route: '/profile/page', active: false, icon: 'bi-person-circle', badge: null },
        { name: 'My Reviews', route: '/profile/reviews', active: false, icon: 'bi-star', badge: null },
        { name: 'My Questions', route: '/profile/questions', active: false, icon: 'bi-question-circle', badge: null },
        { name: 'My Answers', route: '/profile/answers', active: false, icon: 'bi-chat-square-text', badge: null }
      ]
    },
    {
      section: 'Settings',
      items: [
        { name: 'Communications', route: '/profile/communications', active: false, icon: 'bi-bell', badge: null },
        { name: '2-Step Verification', route: '/profile/security', active: false, icon: 'bi-shield-check', badge: null },
        { name: 'Passkey', route: '/profile/passkey', active: false, icon: 'bi-key', badge: 'dot' }
      ]
    }
  ];

  // Profile Settings sub-items
  profileSettingsItems = [
    { name: 'Account Information', route: '/profile/account', icon: 'bi-person', description: 'Update your personal information' },
    { name: 'Orders', route: '/profile/orders', icon: 'bi-bag', description: 'View and track your orders' },
    { name: 'Refunds', route: '/profile/refunds', icon: 'bi-arrow-clockwise', description: 'Request and track refunds' },
    { name: 'Payment Methods', route: '/profile/payment', icon: 'bi-credit-card', description: 'Manage payment methods' },
    { name: 'Address Book', route: '/profile/addresses', icon: 'bi-geo-alt', description: 'Manage delivery addresses' },
    { name: 'My Reviews', route: '/profile/reviews', icon: 'bi-star', description: 'View and manage your reviews' },
    { name: 'My Lists', route: '/profile/lists', icon: 'bi-heart', description: 'Manage your wishlists' },
    { name: 'Rewards', route: '/profile/rewards', icon: 'bi-gift', description: 'View rewards and credits' },
    { name: 'Messages', route: '/profile/messages', icon: 'bi-envelope', description: 'View messages and notifications' },
    { name: 'Chat Support', route: '/profile/chat', icon: 'bi-chat-dots', description: 'Get help from support team' },
    { name: 'Security', route: '/profile/security', icon: 'bi-shield-check', description: 'Password and security settings' }
  ];

  // Feature cards
  featureCards = [
    {
      title: 'Orders',
      description: 'Track your order progress, request returns, reorder, or write reviews.',
      icon: 'bi-clipboard-check',
      route: '/profile/orders',
      color: 'primary'
    },
    {
      title: 'Sales & Offers',
      description: 'Shop all of our promotional offers.',
      icon: 'bi-percent',
      route: '/profile/offers',
      color: 'success'
    },
    {
      title: 'My Lists',
      description: 'Add your favorite items to keep track of availability and purchase later!',
      icon: 'bi-heart',
      route: '/profile/lists',
      color: 'danger'
    },
    {
      title: 'Affiliate Program',
      description: 'Become an iHerb affiliate and earn when you share!',
      icon: 'bi-share',
      route: '/profile/affiliate',
      color: 'warning'
    },
    {
      title: 'Address Book',
      description: 'Manage your delivery address(es) in one convenient place.',
      icon: 'bi-geo-alt',
      route: '/profile/addresses',
      color: 'info'
    },
    {
      title: 'Refunds',
      description: 'Request refunds for your orders and track their status.',
      icon: 'bi-arrow-clockwise',
      route: '/profile/refunds',
      color: 'warning'
    },
    {
      title: 'Chat Support',
      description: 'Get help from our support team through live chat.',
      icon: 'bi-chat-dots',
      route: '/profile/chat',
      color: 'primary'
    }
  ];

  constructor(
    private profileService: ProfileService,
    private productService: ProductServices,
    private cartService: CartServices,
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadRecommendedProducts();
    this.loadCartData();
    
    // Debug: Check if data is loading properly
    setTimeout(() => {
      console.log('Data check after 2 seconds:', {
        orders: this.userOrders.length,
        cart: this.cartItems.length,
        profile: this.userProfile ? 'loaded' : 'not loaded'
      });
    }, 2000);
    
    // Set a timeout to ensure loading state is cleared even if API calls fail
    setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false;
        console.log('Loading timeout reached, showing content anyway');
      }
    }, 5000);
  }

  initializeForms(): void {
    // Profile form - only fields that can be updated
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.pattern(/^[0-9+\-\s()]+$/)]]
    });

    // Password form
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    // Email form
    this.emailForm = this.fb.group({
      newEmail: ['', [Validators.required, Validators.email]]
    });

    // Review form
    this.reviewForm = this.fb.group({
      rating: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(10)]]
    });

    // Refund form
    this.refundForm = this.fb.group({
      reason: ['', [Validators.required, Validators.minLength(10)]],
      amount: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      if (confirmPassword?.errors?.['passwordMismatch']) {
        delete confirmPassword.errors['passwordMismatch'];
        if (Object.keys(confirmPassword.errors).length === 0) {
          confirmPassword.setErrors(null);
        }
      }
    }
    return null;
  }

  loadUserData(): void {
    this.isLoading = true;
    
    // Use forkJoin to wait for all API calls to complete
    const apiCalls = [
      this.profileService.getUserProfile().pipe(
        catchError(error => {
          console.error('Error loading user profile:', error);
          return of(null);
        })
      ),
      this.profileService.getUserOrders().pipe(
        catchError(error => {
          console.error('Error loading user orders:', error);
          return of([]);
        })
      ),
      this.profileService.getUserRewards().pipe(
        catchError(error => {
          console.error('Error loading user rewards:', error);
          return of(null);
        })
      ),
      this.profileService.getUserMessages().pipe(
        catchError(error => {
          console.error('Error loading user messages:', error);
          return of([]);
        })
      ),
      this.profileService.getUserRefunds().pipe(
        catchError(error => {
          console.error('Error loading user refunds:', error);
          return of([]);
        })
      ),
      this.profileService.getUserReviews().pipe(
        catchError(error => {
          console.error('Error loading user reviews:', error);
          return of([]);
        })
      ),
      this.profileService.getUserCategories().pipe(
        catchError(error => {
          console.error('Error loading categories:', error);
          return of([]);
        })
      ),
      this.profileService.getUserBrands().pipe(
        catchError(error => {
          console.error('Error loading brands:', error);
          return of([]);
        })
      ),
      this.profileService.getUserChatMessages().pipe(
        catchError(error => {
          console.error('Error loading chat messages:', error);
          return of([]);
        })
      ),
      this.profileService.getUserOTPStatus().pipe(
        catchError(error => {
          console.error('Error loading OTP status:', error);
          return of(null);
        })
      )
    ];

    forkJoin(apiCalls).subscribe({
      next: ([profile, orders, rewards, messages, refunds, reviews, categories, brands, chatMessages, otpStatus]) => {
        
        // Debug logging
        console.log('Profile data loaded:', {
          profile,
          orders,
          ordersLength: orders?.length || 0,
          rewards,
          messages,
          refunds,
          reviews
        });
        
        this.userProfile = profile;
        this.userOrders = orders || [];
        
        // Add mock data for testing if no orders are returned
        if (!orders || orders.length === 0) {
          console.log('No orders returned from API, adding mock data for testing');
          this.userOrders = [
            {
              id: 1,
              orderDate: new Date().toISOString(),
              status: 'Delivered',
              total: 99.99,
              shippingAddress: '123 Main St, City, State 12345',
              orderItems: [
                { productId: 1, quantity: 2 },
                { productId: 2, quantity: 1 },
                { productId: 999, quantity: 1 } // Test product
              ]
            },
            {
              id: 2,
              orderDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
              status: 'Delivered',
              total: 149.50,
              shippingAddress: '456 Oak Ave, City, State 12345',
              orderItems: [
                { productId: 3, quantity: 1 },
                { productId: 4, quantity: 3 }
              ]
            },
            {
              id: 3,
              orderDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
              status: 'Delivered',
              total: 75.25,
              shippingAddress: '789 Pine St, City, State 12345',
              orderItems: [
                { productId: 5, quantity: 2 }
              ]
            },
            {
              id: 4,
              orderDate: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
              status: 'Pending',
              total: 45.99,
              shippingAddress: '321 Elm St, City, State 12345',
              orderItems: [
                { productId: 6, quantity: 1 }
              ]
            },
            {
              id: 5,
              orderDate: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
              status: 'Processing',
              total: 89.50,
              shippingAddress: '654 Maple Ave, City, State 12345',
              orderItems: [
                { productId: 7, quantity: 3 }
              ]
            }
          ];
          
          // Add mock product data to cache for testing
          this.addMockProductsToCache();
        }
        
        // Load product details for order items (after setting up orders)
        this.loadProductDetailsForOrders();
        
        this.userRewards = rewards;
        this.userMessages = messages || [];
        this.userRefunds = (refunds || []).map((refund: any) => ({
          ...refund,
          status: refund.isProcessed ? 'Processed' : 'Pending'
        }));
        
        // Add mock refunds for testing if no refunds are returned
        if (!refunds || refunds.length === 0) {
          console.log('No refunds returned from API, adding mock data for testing');
          this.userRefunds = [
            {
              id: 1,
              reason: 'Product arrived damaged and not as described',
              amount: 29.99,
              requestDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
              processedDate: undefined,
              isProcessed: false,
              orderId: 1,
              status: 'Pending'
            },
            {
              id: 2,
              reason: 'Wrong item shipped, need correct product',
              amount: 45.50,
              requestDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
              processedDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
              isProcessed: true,
              orderId: 2,
              status: 'Processed'
            }
          ];
        }
        this.userReviews = reviews || [];
        
        // Add mock reviews for testing if no reviews are returned
        if (!reviews || reviews.length === 0) {
          console.log('No reviews returned from API, adding mock data for testing');
          this.userReviews = [
            {
              id: 1,
              productId: 1,
              productName: 'COLLAGEN COCONUT CREAMER',
              rating: 5,
              comment: 'Excellent product! Really helps with my daily wellness routine. The taste is great and it mixes well with my morning coffee.',
              createdAt: new Date().toISOString(),
              reviewDate: new Date().toISOString(),
              productImage: 'https://via.placeholder.com/200x200?text=COLLAGEN+CREAMER',
              userId: 'user123',
              userName: 'John Doe'
            },
            {
              id: 2,
              productId: 2,
              productName: 'CALIFORNIA GOLD NUTRITION CollagenUP',
              rating: 4,
              comment: 'Good quality collagen supplement. I noticed improvements in my skin after a few weeks of use. Would recommend to others.',
              createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
              reviewDate: new Date(Date.now() - 86400000).toISOString(),
              productImage: 'https://via.placeholder.com/200x200?text=CollagenUP',
              userId: 'user123',
              userName: 'John Doe'
            },
            {
              id: 3,
              productId: 3,
              productName: 'Vitamin D3 Supplement',
              rating: 5,
              comment: 'Perfect for maintaining healthy vitamin D levels, especially during winter months. Easy to take and no side effects.',
              createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
              reviewDate: new Date(Date.now() - 172800000).toISOString(),
              productImage: 'https://via.placeholder.com/200x200?text=Vitamin+D3',
              userId: 'user123',
              userName: 'John Doe'
            }
          ];
        }
        
        this.userCategories = categories || [];
        this.userBrands = brands || [];
        this.userChatMessages = chatMessages || [];
        this.otpStatus = otpStatus;
        
        // Update unread messages count
        this.unreadMessagesCount = (messages || []).filter((m: any) => !m.isRead).length;
        this.updateMessagesBadge();
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.isLoading = false;
        // Set default values to prevent undefined errors
        this.userOrders = [];
        this.userMessages = [];
        this.userRefunds = [];
        this.userReviews = [];
        this.userCategories = [];
        this.userBrands = [];
        this.userChatMessages = [];
        this.unreadMessagesCount = 0;
      }
    });
  }

  loadProductDetailsForOrders(): void {
    // Collect all unique product IDs from order items
    const productIds = new Set<number>();
    this.userOrders.forEach(order => {
      order.orderItems.forEach(item => {
        productIds.add(item.productId);
      });
    });

    console.log('Loading product details for order items. Product IDs:', Array.from(productIds));

    // Fetch product details for all unique product IDs
    if (productIds.size > 0) {
      const productRequests = Array.from(productIds).map(productId => 
        this.productService.getProductById(productId).pipe(
          catchError(error => {
            console.error(`Error loading product ${productId}:`, error);
            return of(null);
          })
        )
      );

      forkJoin(productRequests).subscribe({
        next: (products) => {
          // Cache the products
          products.forEach(product => {
            if (product) {
              this.productCache.set(product.id, product);
              console.log(`Cached product ${product.id}:`, product.name, 'Image:', product.imagepath);
            }
          });
          console.log('Product cache updated. Total cached products:', this.productCache.size);
          // Trigger change detection to update the template
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading product details:', error);
        }
      });
    } else {
      console.log('No product IDs found in orders, using mock data');
    }
  }

  getProductDetails(productId: number): IProduct | null {
    return this.productCache.get(productId) || null;
  }

  getProductName(productId: number): string {
    const product = this.getProductDetails(productId);
    return product ? product.name : `Product ID: ${productId}`;
  }

  getProductImage(productId: number): string {
    const product = this.getProductDetails(productId);
    console.log(`Getting image for product ${productId}:`, product);
    if (product) {
      // Try different image properties in order of preference
      const imagepath = product.imagepath || product.imageone || 'assets/default-product.svg';
      console.log(`Product ${productId} image URL:`, imagepath);
      return imagepath;
    }
    console.log(`Product ${productId} not found in cache, using default image`);
    return 'assets/default-product.svg';
  }

  getProductPrice(productId: number): number {
    const product = this.getProductDetails(productId);
    return product ? product.price : 0;
  }

  isProductLoaded(productId: number): boolean {
    const isLoaded = this.productCache.has(productId);
    console.log(`isProductLoaded(${productId}): ${isLoaded}, cache size: ${this.productCache.size}`);
    return isLoaded;
  }

  onImageLoad(productId: number): void {
    console.log('Image loaded for product', productId);
  }

  // Test method to force add products to cache for debugging
  testProductCache(): void {
    console.log('Testing product cache...');
    console.log('Current cache size:', this.productCache.size);
    console.log('Current cache contents:', Array.from(this.productCache.entries()));
    
    // Force add a test product
    const testProduct: IProduct = {
      id: 999,
      name: 'TEST PRODUCT',
      price: 99.99,
      description: 'Test product for debugging',
      imagepath: 'https://via.placeholder.com/200x200/FF0000/FFFFFF?text=TEST',
      brandId: 999,
      CreatedAt: new Date(),
      QuantitySold: 1
    };
    
    this.productCache.set(999, testProduct);
    console.log('Test product added to cache');
    this.cdr.detectChanges();
  }

  addMockProductsToCache(): void {
    // Add mock product data for testing when no real data is available
    const mockProducts: IProduct[] = [
      {
        id: 1,
        name: 'COLLAGEN COCONUT CREAMER',
        price: 19.99,
        description: 'Premium collagen creamer for daily wellness',
        imagepath: 'https://via.placeholder.com/200x200/4CAF50/FFFFFF?text=COLLAGEN',
        brandId: 1,
        CreatedAt: new Date(),
        QuantitySold: 150
      },
      {
        id: 2,
        name: 'CALIFORNIA GOLD NUTRITION CollagenUP',
        price: 24.99,
        description: 'Advanced collagen formula with hyaluronic acid and vitamin C',
        imagepath: 'https://via.placeholder.com/200x200/2196F3/FFFFFF?text=CollagenUP',
        brandId: 2,
        CreatedAt: new Date(),
        QuantitySold: 200
      },
      {
        id: 3,
        name: 'Vitamin D3 Supplement',
        price: 15.99,
        description: 'Essential vitamin D3 for bone and immune health',
        imagepath: 'https://via.placeholder.com/200x200/FF9800/FFFFFF?text=Vitamin+D3',
        brandId: 3,
        CreatedAt: new Date(),
        QuantitySold: 300
      },
      {
        id: 4,
        name: 'Omega-3 Fish Oil',
        price: 22.99,
        description: 'High-quality fish oil for heart and brain health',
        imagepath: 'https://via.placeholder.com/200x200/9C27B0/FFFFFF?text=Omega-3',
        brandId: 4,
        CreatedAt: new Date(),
        QuantitySold: 180
      },
      {
        id: 5,
        name: 'Probiotics Complex',
        price: 29.99,
        description: 'Multi-strain probiotic for digestive wellness',
        imagepath: 'https://via.placeholder.com/200x200/E91E63/FFFFFF?text=Probiotics',
        brandId: 5,
        CreatedAt: new Date(),
        QuantitySold: 120
      },
      {
        id: 6,
        name: 'Multivitamin for Women',
        price: 18.99,
        description: 'Complete multivitamin formulated for women',
        imagepath: 'https://via.placeholder.com/200x200/00BCD4/FFFFFF?text=Multivitamin',
        brandId: 6,
        CreatedAt: new Date(),
        QuantitySold: 250
      },
      {
        id: 7,
        name: 'Magnesium Glycinate',
        price: 16.99,
        description: 'High-absorption magnesium for better sleep and muscle recovery',
        imagepath: 'https://via.placeholder.com/200x200/795548/FFFFFF?text=Magnesium',
        brandId: 7,
        CreatedAt: new Date(),
        QuantitySold: 175
      }
    ];

    // Add mock products to cache
    mockProducts.forEach(product => {
      this.productCache.set(product.id, product);
      console.log(`Mock product ${product.id} added to cache:`, product.name, 'Image:', product.imagepath);
    });
    
    console.log('Mock products added to cache. Total products:', this.productCache.size);
    
    // Trigger change detection to update the template
    this.cdr.detectChanges();
  }

  loadRecommendedProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        // Get random products for recommendations
        this.recommendedProducts = this.shuffleArray(products).slice(0, 6);
      },
      error: (error) => {
        console.error('Error loading recommended products:', error);
        // Set some mock products if API fails
        this.recommendedProducts = [
          {
            id: 1,
            name: 'COLLAGEN COCONUT CREAMER',
            price: 19.99,
            imagepath: 'https://via.placeholder.com/200x200?text=COLLAGEN+CREAMER',
            description: 'Premium collagen creamer for daily wellness',
            CreatedAt: new Date(),
            QuantitySold: 150,
            brandId: 1
          },
          {
            id: 2,
            name: 'CALIFORNIA GOLD NUTRITION CollagenUP Hydrolyzed Marine Collagen + Hyaluronic Acid + Vitamin C',
            price: 24.99,
            imagepath: 'https://via.placeholder.com/200x200?text=CollagenUP',
            description: 'Advanced collagen formula with hyaluronic acid and vitamin C',
            CreatedAt: new Date(),
            QuantitySold: 200,
            brandId: 2
          },
          {
            id: 3,
            name: 'Vitamin D3 Supplement',
            price: 15.99,
            imagepath: 'https://via.placeholder.com/200x200?text=Vitamin+D3',
            description: 'Essential vitamin D3 for bone and immune health',
            CreatedAt: new Date(),
            QuantitySold: 300,
            brandId: 3
          },
          {
            id: 4,
            name: 'Omega-3 Fish Oil',
            price: 22.99,
            imagepath: 'https://via.placeholder.com/200x200?text=Omega-3',
            description: 'High-quality fish oil for heart and brain health',
            CreatedAt: new Date(),
            QuantitySold: 180,
            brandId: 4
          },
          {
            id: 5,
            name: 'Probiotics Complex',
            price: 29.99,
            imagepath: 'https://via.placeholder.com/200x200?text=Probiotics',
            description: 'Multi-strain probiotic for digestive wellness',
            CreatedAt: new Date(),
            QuantitySold: 120,
            brandId: 5
          },
          {
            id: 6,
            name: 'Multivitamin for Women',
            price: 18.99,
            imagepath: 'https://via.placeholder.com/200x200?text=Multivitamin',
            description: 'Complete multivitamin formulated for women',
            CreatedAt: new Date(),
            QuantitySold: 250,
            brandId: 6
          }
        ];
      }
    });
  }

  updateMessagesBadge(): void {
    const messagesItem = this.navigationItems[0].items.find(item => item.name === 'Messages');
 
  }

  shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  getInitials(): string {
    if (!this.userProfile) return 'U';
    return `${this.userProfile.firstName?.charAt(0) || ''}${this.userProfile.lastName?.charAt(0) || ''}`.toUpperCase();
  }

  getUserDisplayName(): string {
    if (!this.userProfile) return 'User';
    return `${this.userProfile.firstName || ''} ${this.userProfile.lastName || ''}`.trim() || 'User';
  }

  getUserEmail(): string {
    if (!this.userProfile) return 'user@example.com';
    return this.userProfile.email || 'user@example.com';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  scrollCarousel(direction: 'left' | 'right' | number): void {
    if (this.productList) {
      const scrollAmount = 220; // Width of one product card + gap
      const currentScroll = this.productList.nativeElement.scrollLeft;
      let newScroll: number;
      
      if (typeof direction === 'number') {
        newScroll = currentScroll + (direction * scrollAmount);
      } else {
        newScroll = direction === 'left' 
          ? currentScroll - scrollAmount 
          : currentScroll + scrollAmount;
      }
      
      this.productList.nativeElement.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  }

  onImageError(event: any): void {
    event.target.src = 'assets/default-product.svg';
  }

  isDashboardRoute(): boolean {
    return this.router.url === '/profile' || this.router.url === '/profile/';
  }

  isSettingsRoute(): boolean {
    return this.router.url === '/profile/settings';
  }

  isOrdersRoute(): boolean {
    return this.router.url === '/profile/orders';
  }

  isReviewsRoute(): boolean {
    return this.router.url === '/profile/reviews';
  }

  isMessagesRoute(): boolean {
    return this.router.url === '/profile/messages';
  }

  isAccountRoute(): boolean {
    return this.router.url === '/profile/account';
  }

  isAddressesRoute(): boolean {
    return this.router.url === '/profile/addresses';
  }

  isPaymentRoute(): boolean {
    return this.router.url === '/profile/payment';
  }

  isListsRoute(): boolean {
    return this.router.url === '/profile/lists';
  }

  isRewardsRoute(): boolean {
    return this.router.url === '/profile/rewards';
  }

  isRefundsRoute(): boolean {
    return this.router.url === '/profile/refunds';
  }

  // Scroll to section methods
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  isActiveSection(sectionName: string): boolean {
    const sectionId = sectionName.toLowerCase().replace(' ', '');
    const element = document.getElementById(sectionId);
    if (element) {
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top <= 100 && rect.bottom >= 100;
      return isVisible;
    }
    return false;
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  // Profile editing methods
  startEditingProfile(): void {
    if (this.userProfile) {
      this.profileForm.patchValue({
        firstName: this.userProfile.firstName || '',
        phoneNumber: this.userProfile.phoneNumber || ''
      });
    }
    this.isEditingProfile = true;
    this.clearMessages();
  }

  startEditingPassword(): void {
    this.passwordForm.reset();
    this.isEditingPassword = true;
    this.clearMessages();
  }

  startEditingEmail(): void {
    this.emailForm.patchValue({
      newEmail: this.userProfile?.email || ''
    });
    this.isEditingEmail = true;
    this.clearMessages();
  }

  cancelEditing(): void {
    this.isEditingProfile = false;
    this.isEditingPassword = false;
    this.isEditingEmail = false;
    this.clearMessages();
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      this.isSaving = true;
      this.clearMessages();

      // Only send FirstName and PhoneNumber as per backend DTO
      const profileData = {
        firstName: this.profileForm.value.firstName,
        phoneNumber: this.profileForm.value.phoneNumber
      };
      
      this.profileService.updateProfile(profileData).subscribe({
        next: (response) => {
          this.showMessage('Profile updated successfully!', 'success');
          this.isEditingProfile = false;
          this.loadUserData(); // Reload user data
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.showMessage('Failed to update profile. Please try again.', 'error');
        },
        complete: () => {
          this.isSaving = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.profileForm);
    }
  }

  savePassword(): void {
    if (this.passwordForm.valid) {
      this.isSaving = true;
      this.clearMessages();

      const { currentPassword, newPassword } = this.passwordForm.value;
      this.profileService.changePassword(currentPassword, newPassword).subscribe({
        next: (response) => {
          this.showMessage('Password changed successfully!', 'success');
          this.isEditingPassword = false;
          this.passwordForm.reset();
        },
        error: (error) => {
          console.error('Error changing password:', error);
          this.showMessage('Failed to change password. Please check your current password.', 'error');
        },
        complete: () => {
          this.isSaving = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.passwordForm);
    }
  }

  saveEmail(): void {
    if (this.emailForm.valid) {
      this.isSaving = true;
      this.clearMessages();

      const { newEmail } = this.emailForm.value;
      this.profileService.updateEmail(newEmail).subscribe({
        next: (response) => {
          this.showMessage('Email update request sent! Please check your new email for verification.', 'success');
          this.isEditingEmail = false;
          this.loadUserData(); // Reload user data
        },
        error: (error) => {
          console.error('Error updating email:', error);
          this.showMessage('Failed to update email. Please try again.', 'error');
        },
        complete: () => {
          this.isSaving = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.emailForm);
    }
  }

  showMessage(message: string, type: 'success' | 'error'): void {
    this.saveMessage = message;
    this.saveMessageType = type;
    setTimeout(() => {
      this.clearMessages();
    }, 5000);
  }

  clearMessages(): void {
    this.saveMessage = '';
    this.saveMessageType = '';
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['pattern']) return 'Please enter a valid phone number';
      if (field.errors['min']) return `Age must be at least ${field.errors['min'].min}`;
      if (field.errors['max']) return `Age must be at most ${field.errors['max'].max}`;
      if (field.errors['passwordMismatch']) return 'Passwords do not match';
    }
    return '';
  }

  // Cart Methods
  loadCartData(): void {
    this.cartService.getCartItems().subscribe({
      next: (cartItems: any[]) => {
        this.cartItems = cartItems || [];
      },
      error: (error: any) => {
        console.error('Error loading cart:', error);
        this.cartItems = [];
        // Show user-friendly message if needed
        if (error.status === 401) {
          console.log('User not authenticated for cart access');
        }
      }
    });
  }

  updateQuantity(itemId: number, newQuantity: number): void {
    if (newQuantity < 1) return;
    
    this.cartService.updateQuantity(itemId, newQuantity).subscribe({
      next: () => {
        this.loadCartData(); // Reload cart data
      },
      error: (error: any) => {
        console.error('Error updating quantity:', error);
      }
    });
  }

  removeFromCart(itemId: number): void {
    this.cartService.removeFromCart(itemId).subscribe({
      next: () => {
        this.loadCartData(); // Reload cart data
      },
      error: (error: any) => {
        console.error('Error removing from cart:', error);
      }
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: () => {
        this.loadCartData(); // Reload cart data
      },
      error: (error: any) => {
        console.error('Error clearing cart:', error);
      }
    });
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  addToCart(productId: number, event: Event): void {
    event.stopPropagation(); // Prevent product click
    this.cartService.addToCart(productId, 1).subscribe({
      next: () => {
        this.loadCartData(); // Reload cart data
      },
      error: (error: any) => {
        console.error('Error adding to cart:', error);
      }
    });
  }

  // Cart calculation methods
  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  getCartSubtotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getShippingCost(): number {
    const subtotal = this.getCartSubtotal();
    return subtotal > 50 ? 0 : 9.99; // Free shipping over $50
  }

  getCartTotal(): number {
    return this.getCartSubtotal() + this.getShippingCost();
  }

  // Order Methods
  viewOrderDetails(orderId: number): void {
    this.router.navigate(['/profile/orders', orderId]);
  }

  reorderItems(order: any): void {
    // Add all items from the order back to cart
    order.orderItems.forEach((item: any) => {
      this.cartService.addToCart(item.productId, item.quantity).subscribe({
        next: () => {
          this.loadCartData();
        },
        error: (error: any) => {
          console.error('Error adding item to cart:', error);
        }
      });
    });
  }

  requestRefund(orderId: number): void {
    const order = this.userOrders.find(o => o.id === orderId);
    if (order) {
      this.selectedOrderForRefund = order;
      this.refundForm.patchValue({
        amount: order.total
      });
      this.isCreatingRefund = true;
      this.clearMessages();
    }
  }

  cancelOrder(orderId: number): void {
    if (confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      this.isSaving = true;
      this.clearMessages();

      // Debug information
      console.log('Attempting to cancel order:', orderId);
      console.log('Available orders:', this.userOrders.map(o => ({ id: o.id, status: o.status })));

      // Always call the real API to cancel orders in the database
      this.profileService.cancelOrder(orderId).subscribe({
        next: (response) => {
          console.log('Order cancellation response:', response);
          this.showMessage('Order cancelled successfully!', 'success');
          this.loadUserData(); // Reload user data to get updated orders from database
        },
        error: (error) => {
          console.error('Error cancelling order:', error);
          if (error.status === 404) {
            this.showMessage('Order not found. It may have already been cancelled or deleted.', 'error');
          } else if (error.status === 400) {
            this.showMessage('Order cannot be cancelled. It may already be shipped or delivered.', 'error');
          } else if (error.status === 401) {
            this.showMessage('You are not authorized to cancel this order.', 'error');
          } else {
            this.showMessage('Failed to cancel order. Please try again.', 'error');
          }
        },
        complete: () => {
          this.isSaving = false;
        }
      });
    }
  }

  startRefundRequest(order: IOrder): void {
    this.selectedOrderForRefund = order;
    this.refundForm.patchValue({
      amount: order.total
    });
    this.isCreatingRefund = true;
    this.clearMessages();
  }

  cancelRefundRequest(): void {
    this.isCreatingRefund = false;
    this.selectedOrderForRefund = null;
    this.refundForm.reset();
    this.clearMessages();
  }

  submitRefundRequest(): void {
    if (this.refundForm.valid && this.selectedOrderForRefund) {
      this.isSaving = true;
      this.clearMessages();

      const refundData = {
        reason: this.refundForm.value.reason,
        amount: this.refundForm.value.amount,
        orderId: this.selectedOrderForRefund.id
      };

      this.profileService.createRefundRequest(refundData).subscribe({
        next: (response) => {
          this.showMessage('Refund request submitted successfully!', 'success');
          this.isCreatingRefund = false;
          this.selectedOrderForRefund = null;
          this.refundForm.reset();
          this.loadUserData(); // Reload user data to get updated refunds
        },
        error: (error) => {
          console.error('Error creating refund:', error);
          this.showMessage('Failed to submit refund request. Please try again.', 'error');
        },
        complete: () => {
          this.isSaving = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.refundForm);
    }
  }

  // Debug method to check current state
  debugInfo(): void {
    console.log('Current state:', {
      isLoading: this.isLoading,
      userProfile: this.userProfile,
      userOrders: this.userOrders,
      userOrdersLength: this.userOrders.length,
      cartItems: this.cartItems,
      cartItemsLength: this.cartItems.length,
      userRewards: this.userRewards,
      currentRoute: this.router.url,
      isDashboard: this.isDashboardRoute(),
      isSettings: this.isSettingsRoute(),
      productCache: this.productCache,
      productCacheSize: this.productCache.size
    });
    
    // Log all order items and their product IDs
    this.userOrders.forEach(order => {
      console.log(`Order ${order.id} items:`, order.orderItems);
      order.orderItems.forEach(item => {
        const product = this.getProductDetails(item.productId);
        console.log(`Product ${item.productId}:`, product ? 'Found' : 'Not found', product);
      });
    });
    
    // Force reload data
    this.loadUserData();
    this.loadCartData();
  }

  // Review Management Methods
  startEditingReview(review: any): void {
    this.editingReview = review;
    this.reviewForm.patchValue({
      rating: review.rating,
      comment: review.comment
    });
    this.isEditingReview = true;
    this.clearMessages();
  }

  cancelEditingReview(): void {
    this.isEditingReview = false;
    this.editingReview = null;
    this.reviewForm.reset();
    this.clearMessages();
  }

  saveReview(): void {
    if (this.reviewForm.valid && this.editingReview) {
      this.isSaving = true;
      this.clearMessages();

      const reviewData = {
        rating: this.reviewForm.value.rating,
        comment: this.reviewForm.value.comment
      };

      this.profileService.updateReview(this.editingReview.id, reviewData).subscribe({
        next: (response) => {
          this.showMessage('Review updated successfully!', 'success');
          this.isEditingReview = false;
          this.editingReview = null;
          this.reviewForm.reset();
          this.loadUserData(); // Reload user data to get updated reviews
        },
        error: (error) => {
          console.error('Error updating review:', error);
          this.showMessage('Failed to update review. Please try again.', 'error');
        },
        complete: () => {
          this.isSaving = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.reviewForm);
    }
  }

  deleteReview(review: any): void {
    if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      this.isSaving = true;
      this.clearMessages();

      this.profileService.deleteReview(review.id).subscribe({
        next: (response) => {
          this.showMessage('Review deleted successfully!', 'success');
          this.loadUserData(); // Reload user data to get updated reviews
        },
        error: (error) => {
          console.error('Error deleting review:', error);
          this.showMessage('Failed to delete review. Please try again.', 'error');
        },
        complete: () => {
          this.isSaving = false;
        }
      });
    }
  }

  viewProduct(review: any): void {
    this.router.navigate(['/products', review.productId]);
  }
}
