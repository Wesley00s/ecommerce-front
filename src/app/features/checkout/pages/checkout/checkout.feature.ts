import { Component, inject, OnInit } from '@angular/core';
import { CartService } from '../../../../core/services/cart.service';
import { AuthService } from '../../../../core/services/auth.service';
import { OrderService } from '../../../../core/services/order.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Router, RouterLink } from '@angular/router';
import { combineLatest, map, Observable } from 'rxjs';
import { Cart } from '../../../../core/@types/Cart';
import { User } from '../../../../core/@types/User';
import { AsyncPipe, CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { ToRelativePathPipe } from '../../../../shared/pipes/to-relative-path.pipe';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { LoadingContainerComponent } from '../../../../shared/components/loading-container/loading-container.component';

@Component({
   selector: 'app-checkout',
   imports: [
      RouterLink,
      AsyncPipe,
      ToRelativePathPipe,
      CurrencyPipe,
      ButtonComponent,
      NgOptimizedImage,
      LoadingContainerComponent,
   ],
   templateUrl: './checkout.feature.html',
   styleUrl: './checkout.feature.sass',
})
export class CheckoutFeature implements OnInit {
   private cartService = inject(CartService);
   private authService = inject(AuthService);
   private orderService = inject(OrderService);
   private toastService = inject(ToastService);
   private router = inject(Router);

   state$!: Observable<{
      cart: Cart;
      user: User;
      loading: boolean;
   }>;

   isProcessingOrder = false;

   ngOnInit() {
      this.state$ = combineLatest([
         this.cartService.getCart(),
         this.authService.getAuthenticatedUser(),
      ]).pipe(
         map(([cart, user]) => {
            const activeItems = cart.items.filter(
               (i) => i.status === 'PENDING',
            );
            const activeCart = { ...cart, items: activeItems };

            return {
               cart: activeCart,
               user: user!,
               loading: false,
            };
         }),
      );
   }

   placeOrder() {
      this.isProcessingOrder = true;

      this.orderService.createOrder().subscribe({
         next: (orderResponse) => {
            this.toastService.showSuccess(
               `Pedido #${orderResponse.orderId} realizado com sucesso!`,
            );

            this.cartService.refreshCart();
            this.router.navigate(['/orders/history']);
         },
         error: (err) => {
            console.error(err);
            this.toastService.showError(
               'Erro ao processar o pedido. Tente novamente.',
            );
            this.isProcessingOrder = false;
         },
      });
   }
}
