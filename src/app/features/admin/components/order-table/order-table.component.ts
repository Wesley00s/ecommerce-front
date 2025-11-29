import { Component, EventEmitter, Input, Output } from '@angular/core';
import { OrderShoppingResponse } from '../../../../core/@types/OrderShoppingResponse';
import { OrderStatus } from '../../../../core/enum/OrderStatus';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';

@Component({
   selector: 'app-order-table',
   imports: [DatePipe, CurrencyPipe, NgClass],
   templateUrl: './order-table.component.html',
   styleUrl: './order-table.component.sass',
})
export class OrderTableComponent {
   @Input({ required: true }) orders: OrderShoppingResponse[] = [];

   @Output() approve = new EventEmitter<number>();
   @Output() reject = new EventEmitter<number>();
   @Output() viewDetails = new EventEmitter<OrderShoppingResponse>();

   readonly OrderStatus = OrderStatus;

   calculateTotal(order: OrderShoppingResponse): number {
      return order.items.reduce(
         (acc, item) => acc + item.price * item.quantity,
         0,
      );
   }

   getStatusColor(status: OrderStatus): string {
      switch (status) {
         case OrderStatus.COMPLETED:
            return 'bg-green-100 text-green-700 border-green-200';
         case OrderStatus.CANCELLED:
            return 'bg-red-100 text-red-700 border-red-200';
         default:
            return 'bg-blue-100 text-blue-700 border-blue-200';
      }
   }

   getStatusLabel(status: OrderStatus): string {
      switch (status) {
         case OrderStatus.COMPLETED:
            return 'Aprovado';
         case OrderStatus.CANCELLED:
            return 'Rejeitado/Cancelado';
         case OrderStatus.CREATED:
            return 'Pendente';
         default:
            return status;
      }
   }
}
