import { Routes } from '@angular/router';
import { Home } from './Components/home/home';
import { NotFound } from './Components/not-found/not-found';
import { ProductList } from './Components/products/product-list/product-list';

import { ProductDetails } from './Components/products/product-details/product-details';
import { LoginRegister } from './Components/login-register/login-register';
import { VerifyEmail } from './Components/verify-email/verify-email';
import {noAuthGuard} from './Guards/no-auth-guard';

export const routes: Routes = [

    { path: '', redirectTo: '/home', pathMatch: 'full' },
    {path: 'home' , component: Home , title: 'Home'},
    {path: 'productsList' , component: ProductList},
    { path: 'product/:id', component: ProductDetails },
    {path: 'NotFound' , component: NotFound},
    {path: 'login-register' , component: LoginRegister , title: 'Login / Register' , canActivate: [noAuthGuard]},
    {path: 'verify-email' , component: VerifyEmail , title: 'Verify Email' , canActivate: [noAuthGuard]},

    {path: '**', redirectTo: '/NotFound'}

];
