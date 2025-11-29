import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ToRelativePathPipe } from '../../../../shared/pipes/to-relative-path.pipe';
import { RouterLink } from '@angular/router';
import { QuantityStepperComponent } from '../../../../shared/components/quantity-stepper/quantity-stepper.component';
import { CartItem } from '../../../../core/@types/CartItem';
import { ItemStatus } from '../../../../core/enum/ItemStatus';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';

@Component({
   selector: 'app-cart-item',
   imports: [
      ToRelativePathPipe,
      RouterLink,
      QuantityStepperComponent,
      CurrencyPipe,
      NgOptimizedImage,
   ],
   templateUrl: './cart-item.component.html',
   styleUrl: './cart-item.component.sass',
})
export class CartItemComponent {
   @Input({ required: true }) item!: CartItem;
   @Output() quantityUpdate = new EventEmitter<number>();
   @Output() remove = new EventEmitter<void>();
   @Output() toggleSelect = new EventEmitter<boolean>();

   onQuantityChange(newQty: number) {
      this.quantityUpdate.emit(newQty);
   }

   onRemove() {
      this.remove.emit();
   }

   protected readonly ItemStatus = ItemStatus;

   onToggleSelection(event: Event) {
      const input = event.target as HTMLInputElement;
      this.toggleSelect.emit(input.checked);
   }
}
