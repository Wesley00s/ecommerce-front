import { Routes } from '@angular/router';
import { HomeFeature } from './features/home/pages/home/home.feature';
import { ProductsFeature } from './features/products/pages/products/products.feature';
import { CategoriesFeature } from './features/category/page/categories/categories.feature';
import { authGuard } from './core/guards/auth-guard';
import { AdminLayoutComponent } from './features/admin/layout/admin-layout/admin-layout.component';
import { CategoryManagementFeature } from './features/admin/pages/category-management/category-management.feature';
import { ProductManagementFeature } from './features/admin/pages/product-management/product-management.feature';
import { CategoryLayoutComponent } from './features/category/layout/category-layout/category-layout.component';

export const routes: Routes = [
   { path: '', component: HomeFeature },
   { path: 'products/details/:code', component: ProductsFeature },
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
      ],
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
