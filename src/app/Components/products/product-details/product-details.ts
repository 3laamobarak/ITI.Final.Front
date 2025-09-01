import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IProduct } from '../../../Models/iproduct';
import { ActivatedRoute } from '@angular/router';
import { ProductServices } from '../../../Services/product-services';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductSlider } from '../product-slider/product-slider';

@Component({
  selector: 'app-product-details',
  imports: [CommonModule, FormsModule, ProductSlider],
  templateUrl: './product-details.html',
  styleUrls: ['./product-details.css'],
})
export class ProductDetails implements OnInit {
  productsAlsoViewed: IProduct[] = [];
  product: IProduct | null = null;
  loading = true;
  qty = 1;
  activeImageIndex = 0;
  galleryImages: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private productService: ProductServices,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
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
        },
        error: (err) => {
          console.error('Error loading product:', err);
          this.loading = false;
        },
      });
    }

    
    this.productService.getAllProducts().subscribe((data) => {
      
      if (this.product){
                this.productsAlsoViewed = data.filter((p) => p.brandId !== this.product?.brandId );
      }
      else{
        this.productsAlsoViewed = data;
      }
     
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
    console.log('Add to cart', product, qty);
  }

  getStars(rating: number): string {
    let fullStars = Math.floor(rating);
    let halfStar = rating % 1 >= 0.5 ? 1 : 0;
    let emptyStars = 5 - fullStars - halfStar;

    let starsHtml = '';
    for (let i = 0; i < fullStars; i++) {
      starsHtml += `<i class="bi bi-star-fill text-warning"></i>`;
    }
    if (halfStar) {
      starsHtml += `<i class="bi bi-star-half text-warning"></i>`;
    }
    for (let i = 0; i < emptyStars; i++) {
      starsHtml += `<i class="bi bi-star text-warning"></i>`;
    }
    return starsHtml;
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
}
