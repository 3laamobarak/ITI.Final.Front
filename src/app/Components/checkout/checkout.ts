import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CartServices } from '../../Services/cart-services';
import { PaymentService } from '../../Services/paymentServices';
import { CartItem } from '../../Models/ICartItem';
import { DecimalPipe, CommonModule } from '@angular/common';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

const stripePromise = loadStripe('pk_test_51RpsttIlJTDcsxVbrNH3iCtOmofVqmepwW4sMhlb3c6bHTuaOQVnXBQ4Tj0583pZCaFT7iKkTOKHb0CkbFrKRAEi00IqswNsrn');

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css'],
    imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DecimalPipe 
  ],
})
export class CheckoutComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cardElement', { static: false }) cardElement!: ElementRef;

  cartItems: CartItem[] = [];
  total: number = 0;
  shippingAddress: any = {
    fullName: '',
    address: '',
    city: '',
    zip: '',
  };
  paymentMethod: string = 'creditCard';
  loading: boolean = false;
clientSecret: string = '';
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  card: StripeCardElement | null = null;

  constructor(
    private cartService: CartServices,
    private paymentService: PaymentService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cartService.getCartItems().subscribe({
      next: (items: CartItem[]) => {
        this.cartItems = items;
        this.updateTotal();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching cart items:', err),
    });

    stripePromise.then((stripe) => {
      this.stripe = stripe;
      this.cdr.detectChanges();
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.stripe && this.cardElement) {
        this.elements = this.stripe.elements();
        this.card = this.elements.create('card', {
          style: {
            base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4' } },
            invalid: { color: '#9e2146' },
          },
        });
        this.card.mount(this.cardElement.nativeElement);
      }
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.card) {
      this.card.destroy();
      this.card = null;
    }
  }

  updateTotal() {
    this.total = this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

async onSubmit() {
  // Validate form data
  if (!this.shippingAddress.fullName || !this.shippingAddress.address || 
      !this.shippingAddress.city || !this.shippingAddress.zip) {
    alert('Please fill in all shipping address fields.');
    return;
  }

  if (this.cartItems.length === 0) {
    alert('Your cart is empty.');
    return;
  }

  if (this.total <= 0) {
    alert('Invalid total amount.');
    return;
  }

  this.loading = true;

  const shippingAddressString = `${this.shippingAddress.fullName}, ${this.shippingAddress.address}, ${this.shippingAddress.city}, ${this.shippingAddress.zip}`;

  const dto = {
    orderId: 0, // لو Order هيتم إنشاؤه في الباكند
    currency: 'usd',
    amount: this.total, // Backend will add shipping cost
    shippingAddress: shippingAddressString,
    cartItems: this.cartItems.map(i => ({
      cartItemId: i.cartItemId || 0,
      productId: i.productId,
      productName: i.productName || '',
      quantity: i.quantity,
      price: i.price,
      description: i.description || ''
    }))
  };

  console.log('Sending payment data:', dto);

  try {
    const res: any = await this.paymentService.createPayment(dto).toPromise();
    console.log('Payment response:', res);
    
    this.clientSecret = res.clientSecret;

    if (!this.clientSecret) {
      throw new Error('ClientSecret is missing from server response.');
    }

    await this.confirmCardPayment(this.clientSecret);

  } catch (err: any) {
    console.error('Payment creation error:', err);
    let errorMessage = 'Payment failed.';
    
    if (err?.error?.message) {
      errorMessage = err.error.message;
    } else if (err?.message) {
      errorMessage = err.message;
    }
    
    alert(errorMessage);
    this.loading = false;
  }
}



async confirmCardPayment(clientSecret: string) {
  if (!this.stripe || !this.card) {
    alert('Stripe configuration error.');
    this.loading = false;
    return;
  }

  console.log('Confirming payment with client secret:', clientSecret);

  try {
    const result = await this.stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: this.card,
        billing_details: {
          name: this.shippingAddress.fullName,
          address: {
            line1: this.shippingAddress.address,
            city: this.shippingAddress.city,
            postal_code: this.shippingAddress.zip,
          },
        },
      },
    });

    console.log('Payment confirmation result:', result);

    if (result.error) {
      console.error('Payment failed:', result.error);
      alert(`Payment failed: ${result.error.message}`);
      this.loading = false;
      this.cdr.detectChanges();
    } else if (result.paymentIntent?.status === 'succeeded') {
      console.log('Payment succeeded! Confirming with backend...');
      
      // Confirm payment with backend
      try {
        const confirmResult = await this.paymentService.confirmPayment(result.paymentIntent.id).toPromise();
        console.log('Backend confirmation result:', confirmResult);
        
        if (confirmResult.success) {
          console.log('Payment confirmed successfully in backend');
          
          // Clear cart after successful payment
          this.cartService.clearCart().subscribe({
            next: () => console.log('Cart cleared successfully'),
            error: (err) => console.error('Error clearing cart:', err)
          });

          this.router.navigate(['/order-confirmation'], {
            state: {
              orderId: result.paymentIntent.id,      
              amount: this.total + 4, // Display total with shipping for user
              shippingAddress: this.shippingAddress, 
              cartItems: this.cartItems             
            }
          });
        } else {
          console.error('Backend payment confirmation failed');
          alert('Payment confirmation failed. Please contact support.');
        }
      } catch (confirmError) {
        console.error('Error confirming payment with backend:', confirmError);
        alert('Payment confirmation failed. Please contact support.');
      }
      
      this.loading = false;
      this.cdr.detectChanges();
    } else {
      console.log('Payment status:', result.paymentIntent?.status);
      alert(`Payment status: ${result.paymentIntent?.status}`);
      this.loading = false;
      this.cdr.detectChanges();
    }
  } catch (error) {
    console.error('Error during payment confirmation:', error);
    alert('An error occurred during payment confirmation.');
    this.loading = false;
    this.cdr.detectChanges();
  }
}
  onPaymentMethodChange() {
    const cardContainer = this.cardElement?.nativeElement?.parentElement;
    if (!cardContainer) return;
    cardContainer.style.display = this.paymentMethod === 'creditCard' ? 'block' : 'none';
  }
  
}
