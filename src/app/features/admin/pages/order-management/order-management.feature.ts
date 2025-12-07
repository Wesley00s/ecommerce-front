import { Component, inject, OnInit } from '@angular/core';
import { OrderService } from '../../../../core/services/order.service';
import { ToastService } from '../../../../core/services/toast.service';
import {
   BehaviorSubject,
   catchError,
   map,
   Observable,
   of,
   startWith,
   switchMap,
} from 'rxjs';
import { Pagination } from '../../../../core/@types/Pagination';
import { OrderShoppingResponse } from '../../../../core/@types/OrderShoppingResponse';
import { AsyncPipe } from '@angular/common';
import { OrderTableComponent } from '../../components/order-table/order-table.component';
import { AlertModalComponent } from '../../../../shared/components/alert-modal/alert-modal/alert-modal.component';
import { OrderDetailsModalComponent } from '../../components/order-details-modal/order-details-modal.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
   selector: 'app-order-management',
   imports: [
      AsyncPipe,
      OrderTableComponent,
      AlertModalComponent,
      OrderDetailsModalComponent,
      LoadingSpinnerComponent,
   ],
   templateUrl: './order-management.feature.html',
   styleUrl: './order-management.feature.sass',
})
export class OrderManagementFeature implements OnInit {
   private orderService = inject(OrderService);
   private toastService = inject(ToastService);

   private pageSubject = new BehaviorSubject<number>(0);
   private pageSize = 10;

   selectedOrder: OrderShoppingResponse | null = null;

   isRejectModalOpen = false;
   orderToRejectId: number | null = null;

   isApprovedModalOpen = false;
   orderToApproveId: number | null = null;

   state$!: Observable<{
      loading: boolean;
      orders: Pagination<OrderShoppingResponse>;
      error: boolean;
      errorMessage: string;
   }>;

   ngOnInit() {
      this.setupOrdersStream();
   }

   setupOrdersStream() {
      this.state$ = this.pageSubject.pipe(
         switchMap((page) =>
            this.orderService.getAllOrders(page, this.pageSize).pipe(
               map((data) => ({
                  loading: false,
                  orders: data,
                  error: false,
                  errorMessage: '',
               })),
               startWith({
                  loading: true,
                  orders: {
                     data: [],
                     pagination: {
                        page: 0,
                        size: this.pageSize,
                        totalElements: 0,
                        totalPages: 0,
                     },
                  },
                  error: false,
                  errorMessage: '',
               }),
               catchError(() =>
                  of({
                     loading: false,
                     orders: {
                        data: [],
                        pagination: {
                           page: 0,
                           size: this.pageSize,
                           totalElements: 0,
                           totalPages: 0,
                        },
                     },
                     error: true,
                     errorMessage: 'Erro ao carregar pedidos.',
                  }),
               ),
            ),
         ),
      );
   }

   openDetails(order: OrderShoppingResponse) {
      this.selectedOrder = order;
   }

   closeDetails() {
      this.selectedOrder = null;
   }

   onApprove(orderId: number) {
      this.orderToApproveId = orderId;
      this.isApprovedModalOpen = true;
      this.selectedOrder = null;
   }

   onReject(orderId: number) {
      this.orderToRejectId = orderId;
      this.isRejectModalOpen = true;
      this.selectedOrder = null;
   }

   confirmRejection() {
      if (this.orderToRejectId) {
         this.processOrder(this.orderToRejectId, false);
         this.closeRejectModal();
      }
   }

   confirmApprove() {
      if (this.orderToApproveId) {
         this.processOrder(this.orderToApproveId, true);
         this.closeApproveModal();
      }
   }

   closeRejectModal() {
      this.isRejectModalOpen = false;
      this.orderToRejectId = null;
   }

   closeApproveModal() {
      this.isApprovedModalOpen = false;
      this.orderToApproveId = null;
   }

   private processOrder(orderId: number, confirm: boolean) {
      this.orderService.confirmOrder(orderId, confirm).subscribe({
         next: () => {
            this.toastService.showSuccess(
               `Pedido #${orderId} ${confirm ? 'aprovado' : 'rejeitado'} com sucesso.`,
            );
            this.refresh();
         },
         error: () =>
            this.toastService.showError('Erro ao processar o pedido.'),
      });
   }

   refresh() {
      this.pageSubject.next(this.pageSubject.value);
   }

   nextPage(current: number, totalPages: number) {
      if (current < totalPages - 1) this.pageSubject.next(current + 1);
   }

   prevPage(current: number) {
      if (current > 0) this.pageSubject.next(current - 1);
   }
}
