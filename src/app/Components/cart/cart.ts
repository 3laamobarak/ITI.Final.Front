import { Component, OnInit } from '@angular/core';
import { CartServices } from '../../Services/cart-services';
import { ProductServices } from '../../Services/product-services';
import { CartItem } from '../../Models/ICartItem';
import { forkJoin } from 'rxjs';
import { DecimalPipe,CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import{RouterLink} from '@angular/router';

@Component({
  imports: [DecimalPipe, CommonModule,RouterLink],
  selector: 'app-cart',
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class Cart implements OnInit {
  cartItems: CartItem[] = [];
  total: number = 0;
  loading = true;

  constructor(
    private cartService: CartServices,
    private productService: ProductServices,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.loading = true;
    this.cartService.getCartItems().subscribe({
      next: (items: CartItem[]) => {
        const requests = items.map(item =>
          this.productService.getProductById(item.productId.toString())
        );

        if (requests.length === 0) {
          this.cartItems = [];
          this.updateTotal();
          this.loading = false;
          return;
        }

        forkJoin(requests).subscribe((products: any[]) => {
          this.cartItems = items.map((item, index) => ({
            ...item,
            name: products[index].name,
            description: products[index].description,
            price: products[index].price
          }));
          this.updateTotal();
          this.loading = false; 
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error("Error loading cart:", err);
        this.loading = false; 
      }
    });
  }

  updateTotal() {
    this.total = this.cartItems.reduce(
      (sum, item) => sum + (item.price * item.quantity), 0
    );
  }

  increaseQuantity(item: CartItem) {
    this.loading = true;
    const newQuantity = item.quantity + 1;
    
    this.cartService.updateQuantity(item.cartItemId, newQuantity).subscribe({
      next: () => {
        item.quantity = newQuantity;
        this.updateTotal();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error updating quantity:", err);
        this.loading = false;
        this.loadCart(); // Reload cart to ensure UI is in sync with backend
      }
    });
  }

  decreaseQuantity(item: CartItem) {
    if (item.quantity <= 1) return;
    
    this.loading = true;
    const newQuantity = item.quantity - 1;
    
    this.cartService.updateQuantity(item.cartItemId, newQuantity).subscribe({
      next: () => {
        item.quantity = newQuantity;
        this.updateTotal();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error updating quantity:", err);
        this.loading = false;
        this.loadCart(); // Reload cart to ensure UI is in sync with backend
      }
    });
  }

  removeItem(cartItemId: number) {
    this.loading = true;
    this.cartService.removeFromCart(cartItemId).subscribe({
      next: () => {
        console.log("Item removed successfully");
        this.cartItems = this.cartItems.filter(item => item.cartItemId !== cartItemId);
        this.updateTotal();
        this.loading = false; 
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error removing item:", err);
        this.loading = false;
      }
    });
  }

  clearCart() {
    this.loading = true;
    this.cartService.clearCart().subscribe({
      next: () => {
        this.cartItems = [];
        this.updateTotal();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error clearing cart:", err);
        this.loading = false;
      }
    });
  }
}
