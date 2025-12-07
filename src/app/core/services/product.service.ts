import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Pagination } from '../@types/Pagination';
import { Product } from '../@types/Product';
import { SortBy } from '../enum/SortBy';
import { SortDirection } from '../enum/SortDirection';
import { environment } from '../../../environment/enviroment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CreateProductRequest } from '../@types/CreateProductRequest';
import { UpdateProductRequest } from '../@types/UpdateProductRequest';

export interface ProductState {
   loading: boolean;
   product: Product | null;
   error: string | null;
}

@Injectable({
   providedIn: 'root',
})
export class ProductService {
   private readonly apiUrl = `${environment.apiUrl}/ecommerce/api/v1`;
   private http = inject(HttpClient);

   private readonly initialState: ProductState = {
      loading: false,
      product: null,
      error: null,
   };

   private readonly productStateSubject = new BehaviorSubject<ProductState>(
      this.initialState,
   );

   readonly productState$ = this.productStateSubject.asObservable();

   getAllProducts(
      sortBy?: SortBy,
      sortDirection?: SortDirection,
      name = '',
      categoryId?: number,
      page = 0,
      pageSize = 20,
      onlyActive = false,
   ): Observable<Pagination<Product>> {
      let params = new HttpParams()
         .set('page', page.toString())
         .set('pageSize', pageSize.toString())
         .set('onlyActive', onlyActive.toString());
      if (name) params = params.set('name', name);
      if (sortBy) params = params.set('sortBy', sortBy);
      if (sortDirection) params = params.set('sortDirection', sortDirection);
      if (categoryId) params = params.set('categoryId', categoryId.toString());

      return this.http.get<Pagination<Product>>(`${this.apiUrl}/product`, {
         params,
      });
   }

   getTopRatedProducts(limit = 20): Observable<Pagination<Product>> {
      const params = new HttpParams()
         .set('page', '0')
         .set('pageSize', limit.toString())
         .set('sortBy', SortBy.RATING)
         .set('sortDirection', SortDirection.DESC)
         .set('onlyActive', 'true');

      return this.http.get<Pagination<Product>>(`${this.apiUrl}/product`, {
         params,
      });
   }

   getProductByCode(code: string): void {
      this.productStateSubject.next({ ...this.initialState, loading: true });

      this.http.get<Product>(`${this.apiUrl}/product/code/${code}`).subscribe({
         next: (product) => {
            this.productStateSubject.next({
               loading: false,
               product: product,
               error: null,
            });
         },
         error: (err) => {
            this.productStateSubject.next({
               loading: false,
               product: null,
               error: err.message || 'Ocorreu um erro ao buscar o produto.',
            });
         },
      });
   }

   getProductById(id: number): Observable<Product> {
      return this.http.get<Product>(`${this.apiUrl}/product/${id}`);
   }

   createProduct(
      data: CreateProductRequest,
      coverImage: File,
      otherImages: File[],
   ): Observable<Product> {
      const formData = new FormData();
      formData.append(
         'data',
         new Blob([JSON.stringify(data)], { type: 'application/json' }),
      );
      formData.append('coverImage', coverImage);

      otherImages.forEach((file) => {
         formData.append('otherImages', file);
      });

      return this.http.post<Product>(`${this.apiUrl}/product`, formData);
   }

   updateProduct(
      id: number,
      data: UpdateProductRequest,
      newCoverImage?: File,
      newImages?: File[],
   ): Observable<Product> {
      const formData = new FormData();

      formData.append(
         'productData',
         new Blob([JSON.stringify(data)], { type: 'application/json' }),
      );

      if (newCoverImage) {
         formData.append('coverImage', newCoverImage);
      }

      if (newImages && newImages.length > 0) {
         newImages.forEach((file) => {
            formData.append('newImages', file);
         });
      }

      return this.http.put<Product>(`${this.apiUrl}/product/${id}`, formData);
   }

   deleteProduct(id: number): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/product/${id}`);
   }

   updateTotalReviews(newTotal: number): void {
      const currentState = this.productStateSubject.value;
      if (currentState.product) {
         const updatedProduct = {
            ...currentState.product,
            totalReviews: newTotal,
         };

         this.productStateSubject.next({
            ...currentState,
            product: updatedProduct,
         });
      }
   }
}
