import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environment/enviroment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Pagination } from '../@types/Pagination';
import { Review } from '../@types/Review';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { Comment } from '../@types/Comment';
import { CreateReview } from '../@types/CreateReview';
import { CreateReviewResponse } from '../@types/CreateReviewResponse';
import { CreateComment } from '../@types/CreateComment';
import { CreateCommentResponse } from '../@types/CreateCommentResponse';
import { ReviewParams } from '../@types/ReviewParams';
import { ProductService } from './product.service';

export interface ReviewsState {
   loading: boolean;
   reviews: Pagination<Review>;
   error: string | null;
}

@Injectable({
   providedIn: 'root',
})
export class ReviewsService {
   private readonly apiUrl = `${environment.apiUrl}/reviews/api/v1/reviews`;
   private http = inject(HttpClient);
   private authService = inject(AuthService);
   private productService = inject(ProductService);
   private router = inject(Router);

   private _guardIsAuthenticated(): Observable<never> | null {
      const currentUser = this.authService.currentUser();
      if (!currentUser) {
         this.router.navigate(['/login']).then();
         return EMPTY;
      }
      return null;
   }

   private readonly initialState: ReviewsState = {
      loading: true,
      reviews: {
         data: [],
         pagination: {
            page: 0,
            size: 0,
            totalElements: 0,
            totalPages: 0,
         },
      },
      error: null,
   };

   private readonly reviewsStateSubject = new BehaviorSubject<ReviewsState>(
      this.initialState,
   );

   readonly reviewsState$ = this.reviewsStateSubject.asObservable();

   get currentState(): ReviewsState {
      return this.reviewsStateSubject.value;
   }

   getReviewsByProduct(productCode: string, params: ReviewParams = {}): void {
      this.reviewsStateSubject.next({
         ...this.reviewsStateSubject.value,
         loading: true,
      });

      let httpParams = new HttpParams();

      Object.entries(params).forEach(([key, value]) => {
         if (value !== undefined && value !== null) {
            httpParams = httpParams.append(key, value.toString());
         }
      });

      this.http
         .get<Pagination<Review>>(`${this.apiUrl}/product/${productCode}`, {
            params: httpParams,
         })
         .subscribe({
            next: (reviews) => {
               this.reviewsStateSubject.next({
                  loading: false,
                  reviews: reviews,
                  error: null,
               });
               this.productService.updateTotalReviews(
                  reviews.pagination.totalElements,
               );
            },
            error: (err) => {
               this.reviewsStateSubject.next({
                  loading: false,
                  reviews: this.initialState.reviews,
                  error:
                     err.message || 'Ocorreu um erro ao buscar as avaliações.',
               });
            },
         });
   }

   reactToReview(reviewId: string, like: boolean): Observable<void> {
      const guard$ = this._guardIsAuthenticated();
      if (guard$) return guard$;

      const action = like ? 'like' : 'dislike';
      const url = `${this.apiUrl}/${reviewId}/${action}`;

      return this.http.post<void>(url, {});
   }

   reactToComment(
      reviewId: string,
      commentId: string,
      like: boolean,
   ): Observable<void> {
      const guard$ = this._guardIsAuthenticated();
      if (guard$) return guard$;

      const action = like ? 'like' : 'dislike';
      const url = `${this.apiUrl}/${reviewId}/comments/${commentId}/${action}`;

      return this.http.post<void>(url, {});
   }

   getCommentsByReview(
      reviewId: string,
      skip = 0,
      limit = 10,
   ): Observable<Comment[]> {
      return this.http.get<Comment[]>(
         `${this.apiUrl}/${reviewId}/comments?skip=${skip}&limit=${limit}`,
      );
   }

   createReview(createReview: CreateReview): Observable<CreateReviewResponse> {
      const guard$ = this._guardIsAuthenticated();
      if (guard$) return guard$;

      return this.http.post<CreateReviewResponse>(
         `${this.apiUrl}`,
         createReview,
      );
   }

   createComment(
      reviewId: string,
      createComment: CreateComment,
   ): Observable<CreateCommentResponse> {
      const guard$ = this._guardIsAuthenticated();
      if (guard$) return guard$;

      return this.http.post<CreateCommentResponse>(
         `${this.apiUrl}/${reviewId}/comments`,
         createComment,
      );
   }

   deleteReview(reviewId: string): Observable<void> {
      const guard$ = this._guardIsAuthenticated();
      if (guard$) return guard$;

      return this.http.delete<void>(`${this.apiUrl}/${reviewId}`);
   }

   deleteComment(reviewId: string, commentId: string): Observable<void> {
      const guard$ = this._guardIsAuthenticated();
      if (guard$) return guard$;

      return this.http.delete<void>(
         `${this.apiUrl}/${reviewId}/comments/${commentId}`,
      );
   }
}
