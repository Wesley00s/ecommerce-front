import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environment/enviroment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderShoppingResponse } from '../@types/OrderShoppingResponse';
import { OrderHistoryResponse } from '../@types/OrderHistoryResponse';
import { Pagination } from '../@types/Pagination';

@Injectable({
   providedIn: 'root',
})
export class OrderService {
   private readonly apiUrl = `${environment.apiUrl}/ecommerce/api/v1/order`;
   private http = inject(HttpClient);

   createOrder(): Observable<OrderShoppingResponse> {
      return this.http.post<OrderShoppingResponse>(this.apiUrl, {});
   }

   getOrderHistory(): Observable<OrderHistoryResponse[]> {
      return this.http.get<OrderHistoryResponse[]>(`${this.apiUrl}/history`);
   }

   getAllOrders(
      page = 0,
      pageSize = 10,
   ): Observable<Pagination<OrderShoppingResponse>> {
      const params = new HttpParams()
         .set('page', page.toString())
         .set('pageSize', pageSize.toString());

      return this.http.get<Pagination<OrderShoppingResponse>>(
         `${this.apiUrl}/admin/all`,
         { params },
      );
   }

   confirmOrder(
      orderId: number,
      confirm: boolean,
   ): Observable<OrderShoppingResponse> {
      const params = new HttpParams()
         .set('order', orderId.toString())
         .set('confirm', confirm.toString());

      return this.http.post<OrderShoppingResponse>(
         `${this.apiUrl}/admin/confirm`,
         {},
         { params },
      );
   }
}
