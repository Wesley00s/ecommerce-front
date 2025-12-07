import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { CategoryCardComponent } from '../../../../shared/components/category-card/category-card.component';
import { Product } from '../../../../core/@types/Product';
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
import { CategoryService } from '../../../../core/services/category.service';
import { ProductSectionComponent } from '../../../products/components/product-section/product-section.component';

interface CategoryCardData {
   image: string;
   alt: string;
   label: string;
   link: string;
}

interface SectionState {
   loading: boolean;
   loadingMore: boolean;
   products: Pagination<Product>;
   currentPage: number;
   error: boolean;
   errorMessage: string;
}

const INITIAL_SECTION_STATE: SectionState = {
   loading: true,
   loadingMore: false,
   products: {
      data: [],
      pagination: { page: 0, size: 0, totalElements: 0, totalPages: 0 },
   },
   currentPage: 0,
   error: false,
   errorMessage: '',
};

@Component({
   selector: 'app-home-page',
   imports: [
      HeaderComponent,
      CategoryCardComponent,
      AsyncPipe,
      ProductSectionComponent,
   ],
   templateUrl: './home.feature.html',
   styleUrl: './home.feature.sass',
})
export class HomeFeature implements OnInit {
   private productService = inject(ProductService);
   private categoryService = inject(CategoryService);

   private readonly pageSize = 8;

   featuredState$ = new BehaviorSubject<SectionState>({
      ...INITIAL_SECTION_STATE,
   });

   topRatedState$ = new BehaviorSubject<SectionState>({
      ...INITIAL_SECTION_STATE,
   });

   categoriesState$!: Observable<{
      loading: boolean;
      categories: CategoryCardData[];
      error: boolean;
      errorMessage: string;
   }>;

   ngOnInit() {
      this.loadFeaturedProducts();
      this.loadTopRatedProducts();
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

   loadFeaturedProducts(isLoadMore = false) {
      const currentState = this.featuredState$.value;
      this.updateLoadingState(this.featuredState$, currentState, isLoadMore);

      this.productService
         .getAllProducts(
            undefined,
            undefined,
            undefined,
            undefined,
            currentState.currentPage,
            this.pageSize,
            true,
         )
         .pipe(finalize(() => this.finalizeLoading(this.featuredState$)))
         .subscribe(
            this.createObserver(this.featuredState$, currentState, isLoadMore),
         );
   }

   loadMoreFeatured() {
      const state = this.featuredState$.value;
      if (state.currentPage < state.products.pagination.totalPages - 1) {
         this.featuredState$.next({
            ...state,
            currentPage: state.currentPage + 1,
         });
         this.loadFeaturedProducts(true);
      }
   }

   loadTopRatedProducts(isLoadMore = false) {
      const currentState = this.topRatedState$.value;
      this.updateLoadingState(this.topRatedState$, currentState, isLoadMore);
      this.productService
         .getTopRatedProducts(this.pageSize)
         .pipe(finalize(() => this.finalizeLoading(this.topRatedState$)))
         .subscribe(
            this.createObserver(this.topRatedState$, currentState, isLoadMore),
         );
   }

   private updateLoadingState(
      subject: BehaviorSubject<SectionState>,
      currentState: SectionState,
      isLoadMore: boolean,
   ) {
      if (isLoadMore) {
         subject.next({ ...currentState, loadingMore: true });
      } else {
         subject.next({ ...currentState, loading: true });
      }
   }

   private finalizeLoading(subject: BehaviorSubject<SectionState>) {
      const current = subject.value;
      subject.next({ ...current, loading: false, loadingMore: false });
   }

   private createObserver(
      subject: BehaviorSubject<SectionState>,
      currentState: SectionState,
      isLoadMore: boolean,
   ) {
      return {
         next: (response: Pagination<Product>) => {
            const currentData = isLoadMore ? currentState.products.data : [];
            const newData = [...currentData, ...response.data];
            subject.next({
               ...subject.value,
               products: { ...response, data: newData },
               error: false,
               errorMessage: '',
               loading: false,
               loadingMore: false,
            });
         },
         error: (err: { message: string }) => {
            subject.next({
               ...subject.value,
               error: true,
               errorMessage: err.message || 'Erro ao carregar produtos',
               loading: false,
               loadingMore: false,
            });
         },
      };
   }

   loadMoreTopRated() {
      const state = this.topRatedState$.value;
      if (state.currentPage < state.products.pagination.totalPages - 1) {
         this.topRatedState$.next({
            ...state,
            currentPage: state.currentPage + 1,
         });
         this.loadTopRatedProducts(true);
      }
   }

   scrollToProductsSection(): void {
      const element = document.getElementById('products');
      if (element) {
         element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
   }
}
