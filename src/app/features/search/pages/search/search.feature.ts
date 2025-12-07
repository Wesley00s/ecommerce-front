import { Component, inject, OnInit } from '@angular/core';
import { SortBy } from '../../../../core/enum/SortBy';
import { SortDirection } from '../../../../core/enum/SortDirection';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
   BehaviorSubject,
   catchError,
   combineLatest,
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
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

interface SearchState {
   query: string;
   page: number;
   size: number;
   sortBy?: SortBy;
   sortDirection?: SortDirection;
}

@Component({
   selector: 'app-search',
   imports: [
      AsyncPipe,
      RouterLink,
      ReactiveFormsModule,
      ProductCardComponent,
      LoadingSpinnerComponent,
   ],
   templateUrl: './search.feature.html',
   styleUrl: './search.feature.sass',
})
export class SearchFeature implements OnInit {
   private route = inject(ActivatedRoute);
   private router = inject(Router);
   private productService = inject(ProductService);

   sortControl = new FormControl<SortBy | null>(null);
   directionControl = new FormControl<SortDirection>(SortDirection.ASC);

   readonly SortBy = SortBy;
   readonly SortDirection = SortDirection;

   private localStateSubject = new BehaviorSubject<Omit<SearchState, 'query'>>({
      page: 0,
      size: 12,
      sortBy: undefined,
      sortDirection: SortDirection.ASC,
   });

   state$!: Observable<{
      query: string;
      products: Product[];
      pagination: Pagination<Product>['pagination'];
      loading: boolean;
      error: boolean;
   }>;

   ngOnInit(): void {
      this.setupSortListeners();

      this.state$ = combineLatest([
         this.route.queryParams,
         this.localStateSubject,
      ]).pipe(
         switchMap(([params, localState]) => {
            const query = params['q'] || '';

            if (!query.trim()) {
               return of({
                  query: '',
                  products: [],
                  pagination: {
                     page: 0,
                     size: 0,
                     totalElements: 0,
                     totalPages: 0,
                  },
                  loading: false,
                  error: false,
               });
            }

            return this.productService
               .getAllProducts(
                  localState.sortBy,
                  localState.sortDirection,
                  query,
                  undefined,
                  localState.page,
                  localState.size,
                  true,
               )
               .pipe(
                  map((response) => ({
                     query: query,
                     products: response.data,
                     pagination: response.pagination,
                     loading: false,
                     error: false,
                  })),
                  startWith({
                     query: query,
                     products: [],
                     pagination: {
                        page: 0,
                        size: 0,
                        totalElements: 0,
                        totalPages: 0,
                     },
                     loading: true,
                     error: false,
                  }),
                  catchError(() =>
                     of({
                        query: query,
                        products: [],
                        pagination: {
                           page: 0,
                           size: 0,
                           totalElements: 0,
                           totalPages: 0,
                        },
                        loading: false,
                        error: true,
                     }),
                  ),
               );
         }),
      );
   }

   setupSortListeners() {
      combineLatest([
         this.sortControl.valueChanges,
         this.directionControl.valueChanges,
      ]).subscribe(([sort, dir]) => {
         const current = this.localStateSubject.value;
         this.localStateSubject.next({
            ...current,
            sortBy: sort || undefined,
            sortDirection: dir || SortDirection.ASC,
            page: 0,
         });
      });
   }

   nextPage(current: number, total: number) {
      if (current < total - 1) {
         const currentFilters = this.localStateSubject.value;
         this.localStateSubject.next({ ...currentFilters, page: current + 1 });
         this.scrollToTop();
      }
   }

   prevPage(current: number) {
      if (current > 0) {
         const currentFilters = this.localStateSubject.value;
         this.localStateSubject.next({ ...currentFilters, page: current - 1 });
         this.scrollToTop();
      }
   }

   private scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
   }
}
