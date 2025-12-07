import { Component, inject, OnInit } from '@angular/core';
import { OrderService } from '../../../../core/services/order.service';
import { Observable } from 'rxjs';
import { OrderHistoryResponse } from '../../../../core/@types/OrderHistoryResponse';
import { RouterLink } from '@angular/router';
import {
   AsyncPipe,
   CurrencyPipe,
   DatePipe,
   NgClass,
   NgOptimizedImage,
} from '@angular/common';
import { ToRelativePathPipe } from '../../../../shared/pipes/to-relative-path.pipe';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
   selector: 'app-order-history',
   imports: [
      RouterLink,
      AsyncPipe,
      DatePipe,
      CurrencyPipe,
      ToRelativePathPipe,
      NgOptimizedImage,
      NgClass,
      LoadingSpinnerComponent,
   ],
   templateUrl: './order-history.feature.html',
   styleUrl: './order-history.feature.sass',
})
export class OrderHistoryFeature implements OnInit {
   private orderService = inject(OrderService);

   orders$!: Observable<OrderHistoryResponse[]>;

   ngOnInit() {
      this.orders$ = this.orderService.getOrderHistory();
   }

   getStatusColor(status: string): string {
      switch (status) {
         case 'COMPLETED':
            return 'bg-green-100 text-green-700 border-green-200';
         case 'CANCELLED':
            return 'bg-red-100 text-red-700 border-red-200';
         default:
            return 'bg-blue-100 text-blue-700 border-blue-200';
      }
   }

   getStatusLabel(status: string): string {
      switch (status) {
         case 'COMPLETED':
            return 'Concluído';
         case 'CANCELLED':
            return 'Cancelado';
         case 'CREATED':
            return 'Em Processamento';
         default:
            return status;
      }
   }
}
