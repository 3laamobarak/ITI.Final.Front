import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartServices } from '../../Services/cart-services';
import { PaymentService } from '../../Services/paymentServices'; 

@Component({
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.html',
  styleUrls: ['./order-confirmation.css'],
  standalone: true,
  imports: [CommonModule, RouterLink],
})
export class OrderConfirmationComponent implements OnInit {
  orderDetails: {
    orderId?: string;
    total?: number;
    shippingAddress?: { address?: string; city?: string; zip?: string };
    items?: { productName?: string; quantity?: number; price?: number }[];
  } = {};

  paymentStatus: 'pending' | 'success' | 'failed' = 'pending';

  constructor(
    private router: Router,
    private cartService: CartServices,
    private paymentService: PaymentService,
    private cd: ChangeDetectorRef // <-- أضفنا الـ ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const state = history.state;
    this.orderDetails = {
      orderId: state.orderId,
      total: state.amount,
      shippingAddress: state.shippingAddress,
      items: state.cartItems
    };

    if (state.orderId) {
      this.paymentService.confirmPayment(state.orderId).subscribe({
        next: (res) => {
          console.log('Payment confirmed', res);
          this.paymentStatus = 'success';
          this.cd.detectChanges(); // <-- Force Angular to update the view
          this.clearCartAfterPayment();
        },
        error: (err) => {
          console.error('Payment confirmation failed', err);
          this.paymentStatus = 'failed';
          this.cd.detectChanges(); // <-- Force Angular to update the view
        }
      });
    } else {
      this.paymentStatus = 'failed';
      this.cd.detectChanges(); // <-- Force Angular to update the view
    }
  }

  private clearCartAfterPayment() {
    this.cartService.clearCart().subscribe({
      next: () => console.log('Cart cleared successfully after payment'),
      error: (err) => console.error('Failed to clear cart', err)
    });
  }
}
