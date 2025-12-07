import { Component, inject, OnInit, ViewChild } from '@angular/core';
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
import { StripeCardComponent, StripeService } from 'ngx-stripe';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
   StripeCardElementOptions,
   StripeElementsOptions,
} from '@stripe/stripe-js';
import { CreateOrderRequest } from '../../../../core/@types/CreateOrderRequest';
import { PaymentType } from '../../../../core/enum/PaymentType';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
   selector: 'app-checkout',
   imports: [
      RouterLink,
      AsyncPipe,
      ToRelativePathPipe,
      CurrencyPipe,
      ButtonComponent,
      NgOptimizedImage,
      StripeCardComponent,
      ReactiveFormsModule,
      LoadingSpinnerComponent,
   ],
   templateUrl: './checkout.feature.html',
   styleUrl: './checkout.feature.sass',
})
export class CheckoutFeature implements OnInit {
   private cartService = inject(CartService);
   private authService = inject(AuthService);
   private orderService = inject(OrderService);
   private stripeService = inject(StripeService);
   private toastService = inject(ToastService);
   private router = inject(Router);
   private fb = inject(FormBuilder);

   state$!: Observable<{
      cart: Cart;
      user: User;
      loading: boolean;
   }>;

   @ViewChild(StripeCardComponent) card!: StripeCardComponent;

   isProcessingOrder = false;

   paymentForm = this.fb.group({
      method: ['CREDIT_CARD', Validators.required],
      cardHolderName: ['', Validators.required],
   });

   cardOptions: StripeCardElementOptions = {
      style: {
         base: {
            iconColor: '#F97316',
            color: '#31325F',
            fontWeight: '300',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSize: '16px',
            '::placeholder': {
               color: '#CFD7E0',
            },
         },
      },
   };

   elementsOptions: StripeElementsOptions = {
      locale: 'pt-BR',
   };

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
      if (this.paymentForm.invalid) {
         this.paymentForm.markAllAsTouched();
         return;
      }

      this.isProcessingOrder = true;
      const paymentMethod = this.paymentForm.get('method')?.value;

      if (paymentMethod === 'PIX') {
         this.sendOrderToBackend({ paymentType: PaymentType.PIX });
      } else {
         this.processCardPayment();
      }
   }

   private processCardPayment() {
      const name = this.paymentForm.get('cardHolderName')?.value;

      this.stripeService
         .createToken(this.card.element, { name: name || undefined })
         .subscribe({
            next: (result) => {
               if (result.token) {
                  console.log('Stripe Token:', result.token.id);

                  this.sendOrderToBackend({
                     paymentType: PaymentType.CREDIT_CARD,
                     cardToken: result.token.id,
                  });
               } else if (result.error) {
                  this.toastService.showError(
                     result.error.message || 'Erro no cartão',
                  );
                  this.isProcessingOrder = false;
               }
            },
            error: (err) => {
               console.error(err);
               this.toastService.showError('Erro ao conectar com o Stripe');
               this.isProcessingOrder = false;
            },
         });
   }

   private sendOrderToBackend(request: CreateOrderRequest) {
      this.orderService.createOrder(request).subscribe({
         next: (orderResponse) => {
            this.toastService.showSuccess(
               `Pedido #${orderResponse.orderId} realizado!`,
            );
            this.cartService.refreshCart();
            this.router.navigate(['/orders/history']);
         },
         error: (err) => {
            console.error(err);
            this.toastService.showError('Erro ao processar o pedido.');
            this.isProcessingOrder = false;
         },
      });
   }
}
