import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { CategoryCardComponent } from '../../../../shared/components/category-card/category-card.component';
import { Product } from '../../../../core/@types/Product';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';
import { ProductService } from '../../../../core/services/product.service';
import {
   catchError,
   map,
   Observable,
   of,
   startWith,
   BehaviorSubject,
   finalize,
} from 'rxjs';
import { Pagination } from '../../../../core/@types/Pagination';
import { AsyncPipe } from '@angular/common';
import { LoadingContainerComponent } from '../../../../shared/components/loading-container/loading-container.component';
import { ErrorContainerComponent } from '../../../../shared/components/error-container/error-container.component';
import { CategoryService } from '../../../../core/services/category.service';
import { RouterLink } from '@angular/router';

interface CategoryCardData {
   image: string;
   alt: string;
   label: string;
   link: string;
}

interface ProductState {
   loading: boolean;
   loadingMore: boolean;
   products: Pagination<Product>;
   error: boolean;
   errorMessage: string;
}

@Component({
   selector: 'app-home-page',
   imports: [
      HeaderComponent,
      CategoryCardComponent,
      AsyncPipe,
      LoadingContainerComponent,
      ErrorContainerComponent,
      ProductCardComponent,
      RouterLink,
   ],
   templateUrl: './home.feature.html',
   styleUrl: './home.feature.sass',
})
export class HomeFeature implements OnInit {
   private productService = inject(ProductService);
   private categoryService = inject(CategoryService);

   private currentPage = 0;
   private readonly pageSize = 8;

   private readonly initialProductState: Pagination<Product> = {
      data: [],
      pagination: { page: 0, size: 0, totalElements: 0, totalPages: 0 },
   };

   productsState$ = new BehaviorSubject<ProductState>({
      loading: true,
      loadingMore: false,
      products: this.initialProductState,
      error: false,
      errorMessage: '',
   });

   categoriesState$!: Observable<{
      loading: boolean;
      categories: CategoryCardData[];
      error: boolean;
      errorMessage: string;
   }>;

   ngOnInit() {
      this.loadProducts();
      this.loadCategories();
   }

   loadCategories() {
      this.categoriesState$ = this.categoryService.getCategories(0, 10).pipe(
         map((response) => {
            const mappedCategories: CategoryCardData[] = response.data.map(
               (cat) => ({
                  image: cat.imageUrl,
                  label: cat.name,
                  alt: cat.description || cat.name,
                  link: `/category/${cat.name}`,
               }),
            );

            return {
               loading: false,
               categories: mappedCategories,
               error: false,
               errorMessage: '',
            };
         }),
         startWith({
            loading: true,
            categories: [],
            error: false,
            errorMessage: '',
         }),
         catchError((err) => {
            return of({
               loading: false,
               categories: [],
               error: true,
               errorMessage: err.message || 'Erro ao carregar categorias',
            });
         }),
      );
   }

   loadProducts(isLoadMore = false) {
      const currentState = this.productsState$.value;


      if (isLoadMore) {
         this.productsState$.next({ ...currentState, loadingMore: true });
      } else {
         this.productsState$.next({ ...currentState, loading: true });
      }

      this.productService
         .getAllProducts(
            undefined,
            undefined,
            undefined,
            undefined,
            this.currentPage,
            this.pageSize,
            true
         )
         .pipe(
            finalize(() => {

               const current = this.productsState$.value;
               this.productsState$.next({
                  ...current,
                  loading: false,
                  loadingMore: false,
               });
            }),
         )
         .subscribe({
            next: (response) => {
               const currentData = isLoadMore ? currentState.products.data : [];
               const newData = [...currentData, ...response.data];

               this.productsState$.next({
                  loading: false,
                  loadingMore: false,
                  products: {
                     ...response,
                     data: newData,
                  },
                  error: false,
                  errorMessage: '',
               });
            },
            error: (err) => {
               this.productsState$.next({
                  ...currentState,
                  loading: false,
                  loadingMore: false,
                  error: true,
                  errorMessage: err.message || 'Erro ao carregar produtos',
               });
            },
         });
   }

   loadMoreProducts() {
      const currentState = this.productsState$.value;
      const totalPages = currentState.products.pagination.totalPages;

      if (this.currentPage < totalPages - 1) {
         this.currentPage++;
         this.loadProducts(true);
      }
   }

   scrollToProductsSection(): void {
      const element = document.getElementById('products');
      if (element) {
         element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
   }
}
