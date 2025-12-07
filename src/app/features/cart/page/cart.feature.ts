import { Component, inject, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { CartItemComponent } from '../components/cart-item/cart-item.component';
import { AlertModalComponent } from '../../../shared/components/alert-modal/alert-modal/alert-modal.component';
import { CartService } from '../../../core/services/cart.service';
import { Cart } from '../../../core/@types/Cart';
import { ToastService } from '../../../core/services/toast.service';
import { CartItem } from '../../../core/@types/CartItem';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
   selector: 'app-cart-page',
   imports: [
      RouterLink,
      ButtonComponent,
      CurrencyPipe,
      CartItemComponent,
      AsyncPipe,
      AlertModalComponent,
      LoadingSpinnerComponent,
   ],
   templateUrl: './cart.feature.html',
   styleUrl: './cart.feature.sass',
})
export class CartFeature implements OnInit {
   private cartService = inject(CartService);
   private toastService = inject(ToastService);
   private router = inject(Router);
   cart$: Observable<Cart | null> = this.cartService.cart$;

   loading = true;

   isRemoveModalOpen = false;
   itemToRemove: CartItem | null = null;

   selectedItemsCount$ = this.cart$.pipe(
      map((cart) => {
         if (!cart || !cart.items) return 0;
         return cart.items.filter((i) => i.status === 'PENDING').length;
      }),
   );

   ngOnInit() {
      this.loadCart();
   }

   loadCart() {
      this.loading = true;
      this.cartService.getCart().subscribe({
         next: () => (this.loading = false),
         error: () => {
            this.loading = false;
            this.toastService.showError('Erro ao carregar o carrinho.');
         },
      });
   }

   handleQuantityUpdate(item: CartItem, newQuantity: number) {
      const diff = newQuantity - item.quantity;

      if (diff > 0) {
         this.cartService.addToCart(item.product.id!, diff).subscribe({
            error: () =>
               this.toastService.showError('Erro ao atualizar quantidade.'),
         });
      } else if (diff < 0) {
         this.cartService
            .removeQuantityFromCart(item.product.id!, Math.abs(diff))
            .subscribe({
               error: () =>
                  this.toastService.showError('Erro ao atualizar quantidade.'),
            });
      }
   }

   handleRemoveItem(item: CartItem) {
      this.itemToRemove = item;
      this.isRemoveModalOpen = true;
   }

   confirmRemoval() {
      if (this.itemToRemove) {
         this.cartService
            .removeQuantityFromCart(
               this.itemToRemove.product.id!,
               this.itemToRemove.quantity,
            )
            .subscribe({
               next: () => {
                  this.toastService.showSuccess(
                     'Produto removido do carrinho.',
                  );
                  this.closeRemoveModal();
               },
               error: () => {
                  this.toastService.showError('Erro ao remover produto.');
                  this.closeRemoveModal();
               },
            });
      }
   }

   closeRemoveModal() {
      this.isRemoveModalOpen = false;
      this.itemToRemove = null;
   }

   handleToggleSelect(item: CartItem, isSelected: boolean) {
      this.cartService.toggleItemSelection(item.itemID, isSelected).subscribe({
         error: () => this.toastService.showError('Erro ao alterar seleção.'),
      });
   }

   checkout() {
      this.router.navigate(['/checkout']);
   }
}
