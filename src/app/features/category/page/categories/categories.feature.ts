import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import {
   BehaviorSubject,
   catchError,
   map,
   Observable,
   of,
   startWith,
   switchMap,
   tap,
} from 'rxjs';

import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { Product } from '../../../../core/@types/Product';
import { Pagination } from '../../../../core/@types/Pagination';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';
import { LoadingContainerComponent } from '../../../../shared/components/loading-container/loading-container.component';
import { SortBy } from '../../../../core/enum/SortBy';
import { SortDirection } from '../../../../core/enum/SortDirection';
import {
   FilterBarComponent,
   FilterChangeEvent,
} from '../../../../shared/components/filter-bar/filter-bar.component';

interface FilterState {
   page: number;
   size: number;
   name: string;
   sortBy?: SortBy;
   sortDirection?: SortDirection;
}

@Component({
   selector: 'app-categories',
   imports: [
      ProductCardComponent,
      AsyncPipe,
      LoadingContainerComponent,
      RouterLink,
      ReactiveFormsModule,
      FilterBarComponent,
   ],
   templateUrl: './categories.feature.html',
   styleUrl: './categories.feature.sass',
})
export class CategoriesFeature implements OnInit {
   private route = inject(ActivatedRoute);
   private productService = inject(ProductService);
   private categoryService = inject(CategoryService);

   @ViewChild(FilterBarComponent) filterBar!: FilterBarComponent;

   private initialFilterState: FilterState = {
      page: 0,
      size: 10,
      name: '',
      sortBy: undefined,
      sortDirection: SortDirection.ASC,
   };

   private filterSubject = new BehaviorSubject<FilterState>(
      this.initialFilterState,
   );

   state$!: Observable<{
      categoryName: string;
      products: Product[];
      pagination: Pagination<Product>['pagination'];
      loading: boolean;
      error: boolean;
      found: boolean;
   }>;

   ngOnInit(): void {
      this.state$ = this.route.paramMap.pipe(
         tap(() => this.clearFilters(false)),
         switchMap((params) => {
            const paramCategory = params.get('category');
            const isAllProducts =
               !paramCategory || paramCategory.toLowerCase() === 'all';
            const urlCategoryName = paramCategory || '';

            if (isAllProducts) {
               return this.filterSubject.pipe(
                  switchMap((filters) =>
                     this.productService
                        .getAllProducts(
                           filters.sortBy,
                           filters.sortDirection,
                           filters.name,
                           undefined,
                           filters.page,
                           filters.size,
                           true
                        )
                        .pipe(
                           map((prodResponse) => ({
                              categoryName: 'Todos os Produtos',
                              products: prodResponse.data,
                              pagination: prodResponse.pagination,
                              loading: false,
                              error: false,
                              found: true,
                           })),
                        ),
                  ),
                  startWith({
                     categoryName: 'Todos os Produtos',
                     products: [],
                     pagination: {
                        page: 0,
                        size: 0,
                        totalElements: 0,
                        totalPages: 0,
                     },
                     loading: true,
                     error: false,
                     found: true,
                  }),
               );
            }

            return this.categoryService
               .getCategories(0, 1, urlCategoryName)
               .pipe(
                  switchMap((catResponse) => {
                     if (catResponse.data.length > 0) {
                        const category = catResponse.data[0];

                        return this.filterSubject.pipe(
                           switchMap((filters) =>
                              this.productService
                                 .getAllProducts(
                                    filters.sortBy,
                                    filters.sortDirection,
                                    filters.name,
                                    category.id,
                                    filters.page,
                                    filters.size,
                                 )
                                 .pipe(
                                    map((prodResponse) => ({
                                       categoryName: category.name,
                                       products: prodResponse.data,
                                       pagination: prodResponse.pagination,
                                       loading: false,
                                       error: false,
                                       found: true,
                                    })),
                                 ),
                           ),
                           startWith({
                              categoryName: category.name,
                              products: [],
                              pagination: {
                                 page: 0,
                                 size: 0,
                                 totalElements: 0,
                                 totalPages: 0,
                              },
                              loading: true,
                              error: false,
                              found: true,
                           }),
                        );
                     }

                     return of({
                        categoryName: urlCategoryName,
                        products: [],
                        pagination: {
                           page: 0,
                           size: 0,
                           totalElements: 0,
                           totalPages: 0,
                        },
                        loading: false,
                        error: false,
                        found: false,
                     });
                  }),
                  catchError(() =>
                     of({
                        categoryName: urlCategoryName,
                        products: [],
                        pagination: {
                           page: 0,
                           size: 0,
                           totalElements: 0,
                           totalPages: 0,
                        },
                        loading: false,
                        error: true,
                        found: false,
                     }),
                  ),
               );
         }),
      );
   }
   onFilterChange(event: FilterChangeEvent) {
      const current = this.filterSubject.value;
      this.filterSubject.next({
         ...current,
         name: event.name,
         sortBy: event.sortBy,
         sortDirection: event.sortDirection,
         page: 0,
      });
   }

   clearFilters(resetUI = true) {
      if (resetUI && this.filterBar) this.filterBar.reset();
      this.filterSubject.next(this.initialFilterState);
   }

   nextPage(current: number, total: number) {
      if (current < total - 1) {
         const currentFilters = this.filterSubject.value;
         this.filterSubject.next({ ...currentFilters, page: current + 1 });
         this.scrollToTop();
      }
   }

   prevPage(current: number) {
      if (current > 0) {
         const currentFilters = this.filterSubject.value;
         this.filterSubject.next({ ...currentFilters, page: current - 1 });
         this.scrollToTop();
      }
   }

   private scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
   }
}
