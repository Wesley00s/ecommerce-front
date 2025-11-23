import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environment/enviroment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Pagination } from '../@types/Pagination';
import { ProductCategoryResponse } from '../@types/ProductCategoryResponse';

export interface CategoryState {
   loading: boolean;
   category: ProductCategoryResponse | null;
   error: string | null;
}

@Injectable({
   providedIn: 'root',
})
export class CategoryService {
   private readonly apiUrl = `${environment.apiUrl}/ecommerce/api/v1/category`;
   private http = inject(HttpClient);

   private readonly initialState: CategoryState = {
      loading: false,
      category: null,
      error: null,
   };

   private readonly categoryStateSubject = new BehaviorSubject<CategoryState>(
      this.initialState,
   );

   readonly categoryState$ = this.categoryStateSubject.asObservable();

   getCategories(
      page: number,
      pageSize: number,
      name?: string,
   ): Observable<Pagination<ProductCategoryResponse>> {
      let params = new HttpParams()
         .set('page', page.toString())
         .set('pageSize', pageSize.toString());

      if (name) {
         params = params.set('name', name);
      }

      return this.http.get<Pagination<ProductCategoryResponse>>(this.apiUrl, {
         params,
      });
   }

   getCategoryById(id: number): void {
      this.categoryStateSubject.next({ ...this.initialState, loading: true });

      this.http.get<ProductCategoryResponse>(`${this.apiUrl}/${id}`).subscribe({
         next: (category) => {
            this.categoryStateSubject.next({
               loading: false,
               category: category,
               error: null,
            });
         },
         error: (err) => {
            this.categoryStateSubject.next({
               loading: false,
               category: null,
               error: err.message || 'Ocorreu um erro ao buscar a categoria.',
            });
         },
      });
   }

   clearCategoryState(): void {
      this.categoryStateSubject.next(this.initialState);
   }

   createCategory(
      name: string,
      description: string,
      image: File,
   ): Observable<ProductCategoryResponse> {
      const formData = new FormData();
      const categoryData = { name, description };
      formData.append(
         'data',
         new Blob([JSON.stringify(categoryData)], { type: 'application/json' }),
      );
      formData.append('image', image, image.name);

      return this.http.post<ProductCategoryResponse>(this.apiUrl, formData);
   }

   updateCategory(
      id: number,
      name: string,
      description: string,
      newImage?: File,
   ): Observable<ProductCategoryResponse> {
      const formData = new FormData();
      const categoryData = { name, description };
      formData.append(
         'productCategoryData',
         new Blob([JSON.stringify(categoryData)], { type: 'application/json' }),
      );

      if (newImage) {
         formData.append('image', newImage, newImage.name);
      }

      return this.http.put<ProductCategoryResponse>(
         `${this.apiUrl}/${id}`,
         formData,
      );
   }

   deleteCategory(id: number): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/${id}`);
   }
}
