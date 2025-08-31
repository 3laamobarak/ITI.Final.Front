import { Routes } from '@angular/router';
import { Home } from './Components/home/home';
import { NotFound } from './Components/not-found/not-found';
import { ProductList } from './Components/products/product-list/product-list';

import { ProductDetails } from './Components/products/product-details/product-details';
import {Cart} from './Components/cart/cart';
import { CheckoutComponent } from './Components/checkout/checkout';
import { OrderConfirmationComponent } from './Components/order-confirmation/order-confirmation';

export const routes: Routes = [

    { path: '', redirectTo: '/home', pathMatch: 'full' },

    {path: 'home' , component: Home},

    {path: 'productsList' , component: ProductList},


     { path: 'product/:id', component: ProductDetails },

     { path: 'cart', component: Cart },
     { path: 'checkout', component: CheckoutComponent },
  { path: 'order-confirmation', component: OrderConfirmationComponent },

    {path: 'NotFound' , component: NotFound},

    {path: '**', redirectTo: '/NotFound'}
   
];
