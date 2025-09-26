import { Routes } from '@angular/router';
import { ProductDetailsComponent } from './features/products/components/product-details/product-details.component';
import { HomeFeature } from './features/home/pages/home/home.feature';

export const routes: Routes = [
   { path: '', component: HomeFeature },
   { path: 'products/details/:id', component: ProductDetailsComponent },
   { path: '**', redirectTo: '' },
];
