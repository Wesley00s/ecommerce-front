import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { CategoryCardComponent } from '../../../../shared/components/category-card/category-card.component';
import { Product } from '../../../../core/@types/Product';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';
import { ProductService } from '../../../../core/services/product.service';
import { catchError, map, Observable, of, startWith } from 'rxjs';
import { Pagination } from '../../../../core/@types/Pagination';
import { AsyncPipe } from '@angular/common';
import { LoadingContainerComponent } from '../../../../shared/components/loading-container/loading-container.component';
import { ErrorContainerComponent } from '../../../../shared/components/error-container/error-container.component';
import { CategoryService } from '../../../../core/services/category.service';

interface CategoryCardData {
   image: string;
   alt: string;
   label: string;
   link: string;
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
   ],
   templateUrl: './home.feature.html',
   styleUrl: './home.feature.sass',
})
export class HomeFeature implements OnInit {
   private productService = inject(ProductService);
   private categoryService = inject(CategoryService);

   private readonly initialProductState: Pagination<Product> = {
      data: [],
      pagination: { page: 0, size: 0, totalElements: 0, totalPages: 0 },
   };

   productsState$!: Observable<{
      loading: boolean;
      products: Pagination<Product>;
      error: boolean;
      errorMessage: string;
   }>;

   categoriesState$!: Observable<{
      loading: boolean;
      categories: CategoryCardData[];
      error: boolean;
      errorMessage: string;
   }>;

   ngOnInit() {
      this.loadAllProducts();
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

   loadAllProducts() {
      this.productsState$ = this.productService.getAllProducts().pipe(
         map((data) => ({
            loading: false,
            products: data,
            error: false,
            errorMessage: '',
         })),
         startWith({
            loading: true,
            products: this.initialProductState,
            error: false,
            errorMessage: '',
         }),
         catchError((err) => {
            return of({
               loading: false,
               products: this.initialProductState,
               error: true,
               errorMessage: err.message,
            });
         }),
      );
   }
}
