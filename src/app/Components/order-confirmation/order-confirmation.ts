import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartServices } from '../../Services/cart-services';

@Component({
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.html',
  styleUrls: ['./order-confirmation.css'],
  standalone: true,
  imports: [CommonModule,RouterLink],
})
export class OrderConfirmationComponent implements OnInit {
  orderDetails: {
    orderId?: string;
    total?: number;
    shippingAddress?: { address?: string; city?: string; zip?: string };
    items?: { productName?: string; quantity?: number; price?: number }[];
  } = {};

  constructor(private router: Router, private cartService: CartServices) {}

  ngOnInit(): void {
    const state = history.state;
    this.orderDetails = {
      orderId: state.orderId,
      total: state.amount,
      shippingAddress: state.shippingAddress,
      items: state.cartItems
    };

    this.cartService.clearCart().subscribe({
      next: () => console.log('Cart cleared successfully after payment'),
      error: (err) => console.error('Failed to clear cart', err)
    });
  }
}
