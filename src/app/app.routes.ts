import { Routes } from '@angular/router';
import { Home } from './Components/home/home';
import { NotFound } from './Components/not-found/not-found';
import { ProductList } from './Components/products/product-list/product-list';

import { ProductDetails } from './Components/products/product-details/product-details';
import { LoginRegister } from './Components/login-register/login-register';
import { VerifyEmail } from './Components/verify-email/verify-email';

export const routes: Routes = [

    { path: '', redirectTo: '/home', pathMatch: 'full' },
    {path: 'home' , component: Home},
    {path: 'productsList' , component: ProductList},
    { path: 'product/:id', component: ProductDetails },
    {path: 'NotFound' , component: NotFound},
    {path: 'login-register' , component: LoginRegister},
    {path: 'verify-email' , component: VerifyEmail},
    

    {path: '**', redirectTo: '/NotFound'}
   
];
