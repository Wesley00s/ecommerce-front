import { Routes } from '@angular/router';
import { HomeFeature } from './features/home/pages/home/home.feature';
import { ProductsDetailsFeature } from './features/products/pages/products-details/products-details.feature';
import { CategoriesFeature } from './features/category/page/categories/categories.feature';
import { authGuard } from './core/guards/auth-guard';
import { AdminLayoutComponent } from './features/admin/layout/admin-layout/admin-layout.component';
import { CategoryManagementFeature } from './features/admin/pages/category-management/category-management.feature';
import { ProductManagementFeature } from './features/admin/pages/product-management/product-management.feature';
import { CategoryLayoutComponent } from './features/category/layout/category-layout/category-layout.component';
import { OrderHistoryFeature } from './features/order-history/pages/order-history/order-history.feature';
import { OrderManagementFeature } from './features/admin/pages/order-management/order-management.feature';

export const routes: Routes = [
   { path: '', component: HomeFeature },
   { path: 'products/details/:code', component: ProductsDetailsFeature },
   {
      path: 'category',
      component: CategoryLayoutComponent,
      children: [{ path: '', component: CategoriesFeature }],
   },
   {
      path: 'category',
      component: CategoryLayoutComponent,
      children: [{ path: ':category', component: CategoriesFeature }],
   },
   {
      path: 'sign-in',
      loadComponent: () =>
         import('./features/auth/pages/sign-in/sign-in.feature').then(
            (m) => m.SignInFeature,
         ),
   },
   {
      path: 'sign-up',
      loadComponent: () =>
         import('./features/auth/pages/sign-up/sign-up.feature').then(
            (m) => m.SignUpFeature,
         ),
   },
   {
      path: 'admin',
      component: AdminLayoutComponent,
      canActivate: [authGuard],
      children: [
         {
            path: '',
            redirectTo: 'categories',
            pathMatch: 'full',
         },
         {
            path: 'categories',
            component: CategoryManagementFeature,
         },
         {
            path: 'products',
            component: ProductManagementFeature,
         },
         { path: 'orders', component: OrderManagementFeature },
      ],
   },
   {
      path: 'search',
      loadComponent: () =>
         import('./features/search/pages/search/search.feature').then(
            (m) => m.SearchFeature,
         ),
   },
   {
      path: 'checkout',
      loadComponent: () =>
         import('./features/checkout/pages/checkout/checkout.feature').then(
            (m) => m.CheckoutFeature,
         ),
      canActivate: [authGuard],
   },
   {
      path: 'cart',
      loadComponent: () =>
         import('./features/cart/page/cart.feature').then((m) => m.CartFeature),
      canActivate: [authGuard],
   },
   {
      path: 'orders/history',
      component: OrderHistoryFeature,
      canActivate: [authGuard],
   },
   {
      path: 'shop',
      loadComponent: () =>
         import('./features/products/pages/products/products.feature').then(
            (m) => m.ProductsFeature,
         ),
   },
   {
      path: 'profile',
      loadComponent: () =>
         import('./features/profile/page/profile.feature').then(
            (m) => m.ProfileFeature,
         ),
      canActivate: [authGuard],
   },
   { path: '**', redirectTo: '' },
];
