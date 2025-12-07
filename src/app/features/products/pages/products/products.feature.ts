import { Component, inject, ViewChild, OnInit } from '@angular/core';
import { SortBy } from '../../../../core/enum/SortBy';
import { SortDirection } from '../../../../core/enum/SortDirection';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { ReactiveFormsModule } from '@angular/forms';
import {
   BehaviorSubject,
   catchError,
   map,
   Observable,
   of,
   startWith,
   switchMap,
} from 'rxjs';
import { Product } from '../../../../core/@types/Product';
import { Pagination } from '../../../../core/@types/Pagination';
import { AsyncPipe } from '@angular/common';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';
import {
   FilterBarComponent,
   FilterChangeEvent,
} from '../../../../shared/components/filter-bar/filter-bar.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

interface FilterState {
   page: number;
   size: number;
   name: string;
   sortBy?: SortBy;
   sortDirection?: SortDirection;
}

@Component({
   selector: 'app-products',
   imports: [
      AsyncPipe,
      RouterLink,
      ReactiveFormsModule,
      ProductCardComponent,
      FilterBarComponent,
      LoadingSpinnerComponent,
   ],
   templateUrl: './products.feature.html',
   styleUrl: './products.feature.sass',
})
export class ProductsFeature implements OnInit {
   private route = inject(ActivatedRoute);
   private router = inject(Router);
   private productService = inject(ProductService);

   @ViewChild(FilterBarComponent) filterBar!: FilterBarComponent;

   private initialFilterState: FilterState = {
      page: 0,
      size: 12,
      name: '',
      sortBy: undefined,
      sortDirection: SortDirection.ASC,
   };

   private filterSubject = new BehaviorSubject<FilterState>(
      this.initialFilterState,
   );

   initialSearchName = '';
   state$!: Observable<{
      products: Product[];
      pagination: Pagination<Product>['pagination'];
      loading: boolean;
      error: boolean;
      activeFiltersCount: number;
   }>;

   ngOnInit(): void {
      this.initializeFromRoute();
      this.setupProductsStream();
   }

   private initializeFromRoute() {
      const q = this.route.snapshot.queryParamMap.get('q');
      if (q) {
         this.initialSearchName = q;
         this.filterSubject.next({ ...this.initialFilterState, name: q });
      }
   }

   onFilterChange(event: FilterChangeEvent) {
      this.updateUrl(event.name);

      const current = this.filterSubject.value;
      this.filterSubject.next({
         ...current,
         name: event.name,
         sortBy: event.sortBy,
         sortDirection: event.sortDirection || SortDirection.ASC,
         page: 0,
      });
   }

   private updateUrl(term: string) {
      this.router.navigate([], {
         relativeTo: this.route,
         queryParams: term ? { q: term } : { q: null },
         queryParamsHandling: 'merge',
         replaceUrl: true,
      });
   }

   private setupProductsStream() {
      this.state$ = this.filterSubject.pipe(
         switchMap((filters) =>
            this.productService
               .getAllProducts(
                  filters.sortBy,
                  filters.sortDirection,
                  filters.name,
                  undefined,
                  filters.page,
                  filters.size,
                  true,
               )
               .pipe(
                  map((response) => ({
                     products: response.data,
                     pagination: response.pagination,
                     loading: false,
                     error: false,
                     activeFiltersCount:
                        (filters.name ? 1 : 0) + (filters.sortBy ? 1 : 0),
                  })),
                  startWith({
                     products: [],
                     pagination: {
                        page: 0,
                        size: 0,
                        totalElements: 0,
                        totalPages: 0,
                     },
                     loading: true,
                     error: false,
                     activeFiltersCount: 0,
                  }),
                  catchError(() =>
                     of({
                        products: [],
                        pagination: {
                           page: 0,
                           size: 0,
                           totalElements: 0,
                           totalPages: 0,
                        },
                        loading: false,
                        error: true,
                        activeFiltersCount: 0,
                     }),
                  ),
               ),
         ),
      );
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

   clearFilters() {
      if (this.filterBar) this.filterBar.reset();

      this.updateUrl('');

      this.filterSubject.next(this.initialFilterState);
   }

   private scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
   }
}
