import { Routes } from '@angular/router';
import { Home } from './Components/home/home';
import { NotFound } from './Components/not-found/not-found';
import { ProductList } from './Components/products/product-list/product-list';

import { ProductDetails } from './Components/products/product-details/product-details';
import {Cart} from './Components/cart/cart';
import { CheckoutComponent } from './Components/checkout/checkout';
import { OrderConfirmationComponent } from './Components/order-confirmation/order-confirmation';
import { LoginRegister } from './Components/login-register/login-register';
import { VerifyEmail } from './Components/verify-email/verify-email';
import { Profile } from './Components/profile/profile';
import {noAuthGuard} from './Guards/no-auth-guard';
import {authGuard} from './Guards/auth-guard';

export const routes: Routes = [

    { path: '', redirectTo: '/home', pathMatch: 'full' },
    {path: 'home' , component: Home , title: 'Home'},
    {path: 'productsList' , component: ProductList},


     { path: 'product/:id', component: ProductDetails },

     { path: 'cart', component: Cart },
     { path: 'checkout', component: CheckoutComponent },
  { path: 'order-confirmation', component: OrderConfirmationComponent },

    {path: 'profile' , component: Profile , title: 'My Account' , canActivate: [authGuard]},
    {path: 'profile/settings' , component: Profile , title: 'Profile Settings' , canActivate: [authGuard]},
    {path: 'profile/orders' , component: Profile , title: 'My Orders' , canActivate: [authGuard]},
    {path: 'profile/messages' , component: Profile , title: 'Messages' , canActivate: [authGuard]},
    {path: 'profile/account' , component: Profile , title: 'Account Information' , canActivate: [authGuard]},
    {path: 'profile/addresses' , component: Profile , title: 'Address Book' , canActivate: [authGuard]},
    {path: 'profile/payment' , component: Profile , title: 'Payment Methods' , canActivate: [authGuard]},
    {path: 'profile/lists' , component: Profile , title: 'My Lists' , canActivate: [authGuard]},
    {path: 'profile/rewards' , component: Profile , title: 'My Rewards' , canActivate: [authGuard]},
    {path: 'profile/credits' , component: Profile , title: 'Store Credits' , canActivate: [authGuard]},
    {path: 'profile/offers' , component: Profile , title: 'Sales & Offers' , canActivate: [authGuard]},
    {path: 'profile/page' , component: Profile , title: 'My Page' , canActivate: [authGuard]},
    {path: 'profile/reviews' , component: Profile , title: 'My Reviews' , canActivate: [authGuard]},
    {path: 'profile/questions' , component: Profile , title: 'My Questions' , canActivate: [authGuard]},
    {path: 'profile/answers' , component: Profile , title: 'My Answers' , canActivate: [authGuard]},
    {path: 'profile/communications' , component: Profile , title: 'Communications' , canActivate: [authGuard]},
    {path: 'profile/verification' , component: Profile , title: '2-Step Verification' , canActivate: [authGuard]},
    {path: 'profile/passkey' , component: Profile , title: 'Passkey' , canActivate: [authGuard]},
    {path: 'profile/affiliate' , component: Profile , title: 'Affiliate Program' , canActivate: [authGuard]},
    {path: 'profile/refunds' , component: Profile , title: 'Refunds' , canActivate: [authGuard]},
    {path: 'profile/chat' , component: Profile , title: 'Chat Support' , canActivate: [authGuard]},
    {path: 'profile/security' , component: Profile , title: 'Security Settings' , canActivate: [authGuard]},

    {path: 'NotFound' , component: NotFound},
    {path: 'login-register' , component: LoginRegister , title: 'Login / Register' , canActivate: [noAuthGuard]},
    {path: 'verify-email' , component: VerifyEmail , title: 'Verify Email' , canActivate: [noAuthGuard]},

    {path: '**', redirectTo: '/NotFound'}

];
