import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environment/enviroment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Cart } from '../@types/Cart';
import { MessageResponse } from '../@types/MessageResponse';

@Injectable({
   providedIn: 'root',
})
export class CartService {
   private readonly apiUrl = `${environment.apiUrl}/ecommerce/api/v1/cart`;
   private http = inject(HttpClient);

   private cartSubject = new BehaviorSubject<Cart | null>(null);
   cart$ = this.cartSubject.asObservable();

   getCart(): Observable<Cart> {
      return this.http
         .get<Cart>(this.apiUrl)
         .pipe(tap((cart) => this.cartSubject.next(cart)));
   }

   addToCart(productId: number, quantity = 1): Observable<MessageResponse> {
      const params = new HttpParams()
         .set('product', productId.toString())
         .set('quantity', quantity.toString());

      return this.http
         .post<MessageResponse>(this.apiUrl, {}, { params })
         .pipe(tap(() => this.refreshCart()));
   }

   removeQuantityFromCart(
      productId: number,
      quantity = 1,
   ): Observable<MessageResponse> {
      const params = new HttpParams()
         .set('product', productId.toString())
         .set('quantity', quantity.toString());

      return this.http
         .put<MessageResponse>(this.apiUrl, {}, { params })
         .pipe(tap(() => this.refreshCart()));
   }

   toggleItemSelection(
      itemId: number,
      selected: boolean,
   ): Observable<MessageResponse> {
      const params = new HttpParams()
         .set('item', itemId.toString())
         .set('selected', selected.toString());

      return this.http
         .put<MessageResponse>(`${this.apiUrl}/item/unselect`, {}, { params })
         .pipe(
            tap(() => this.refreshCart()),
            tap((message) => {
               console.log(message);
            }),
         );
   }

   refreshCart(): void {
      this.getCart().subscribe();
   }

   clearLocalCart(): void {
      this.cartSubject.next(null);
   }
}
