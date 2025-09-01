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
  this.loading = true;

  const shippingAddressString = `${this.shippingAddress.fullName}, ${this.shippingAddress.address}, ${this.shippingAddress.city}, ${this.shippingAddress.zip}`;

  const dto = {
    orderId: 0, // لو Order هيتم إنشاؤه في الباكند
    currency: 'usd',
    amount: this.total + 4,
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

  try {
    const res: any = await this.paymentService.createPayment(dto).toPromise();
    this.clientSecret = res.clientSecret;

    if (!this.clientSecret) {
      throw new Error('ClientSecret is missing from server response.');
    }

    await this.confirmCardPayment(this.clientSecret);

  } catch (err: any) {
    console.error('Payment creation error:', err);
    alert(err?.message || 'Payment failed.');
    this.loading = false;
  }
}



async confirmCardPayment(clientSecret: string) {
  if (!this.stripe || !this.card) {
    alert('Stripe configuration error.');
    this.loading = false;
    return;
  }

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

  if (result.error) {
    alert(result.error.message);
    this.loading = false;
    this.cdr.detectChanges();
  } else if (result.paymentIntent?.status === 'succeeded') {
    this.loading = false;
    this.cdr.detectChanges();

    this.router.navigate(['/order-confirmation'], {
      state: {
        orderId: result.paymentIntent.id,      
        amount: this.total + 4,                
        shippingAddress: this.shippingAddress, 
        cartItems: this.cartItems             
      }
    });
  }
}
  onPaymentMethodChange() {
    const cardContainer = this.cardElement?.nativeElement?.parentElement;
    if (!cardContainer) return;
    cardContainer.style.display = this.paymentMethod === 'creditCard' ? 'block' : 'none';
  }
  
}
