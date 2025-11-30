import {
   Component,
   CUSTOM_ELEMENTS_SCHEMA,
   ElementRef,
   Input,
   inject,
   ViewChild,
} from '@angular/core';
import { CurrencyPipe, KeyValuePipe, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { StarsComponent } from '../../../../shared/components/stars/stars.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { QuantityStepperComponent } from '../../../../shared/components/quantity-stepper/quantity-stepper.component';
import { ImagePreviewComponent } from '../../../../shared/components/image-preview/image-preview.component';

import { CartService } from '../../../../core/services/cart.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ToRelativePathPipe } from '../../../../shared/pipes/to-relative-path.pipe';
import { Product } from '../../../../core/@types/Product';

import { register, SwiperContainer } from 'swiper/element/bundle';

register();

@Component({
   selector: 'app-product-details',
   standalone: true,
   imports: [
      NgOptimizedImage,
      StarsComponent,
      ButtonComponent,
      QuantityStepperComponent,
      ToRelativePathPipe,
      KeyValuePipe,
      CurrencyPipe,
      RouterLink,
      ImagePreviewComponent,
   ],
   templateUrl: './product-details.component.html',
   styleUrl: './product-details.component.sass',
   schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductDetailsComponent {
   private cartService = inject(CartService);
   private toastService = inject(ToastService);
   private _product!: Product;

   quantity = 1;
   isAddingToCart = false;
   selectedImageForZoom: string | null = null;
   isDescriptionExpanded = false;

   toggleDescription() {
      this.isDescriptionExpanded = !this.isDescriptionExpanded;
   }
   @Input({ required: true })
   set product(value: Product) {
      if (value) {
         this._product = value;
         this.quantity = 1;
         setTimeout(() => this.initializeSwiper(), 0);
      }
   }

   get product(): Product {
      return this._product;
   }

   @ViewChild('mainSwiper') mainSwiper!: ElementRef<SwiperContainer>;
   @ViewChild('thumbsSwiper') thumbsSwiper!: ElementRef<SwiperContainer>;

   updateQuantity(newQuantity: number) {
      this.quantity = newQuantity;
   }

   addToCart() {
      if (!this.product.stock) return;

      this.isAddingToCart = true;

      this.cartService
         .addToCart(this.product.id!, this.quantity)
         .pipe(finalize(() => (this.isAddingToCart = false)))
         .subscribe({
            next: () => {
               this.toastService.showSuccess(
                  `"${this.product.name}" adicionado ao carrinho!`,
               );
            },
            error: () => {
               this.toastService.showError(
                  'Erro ao adicionar produto. Tente novamente.',
               );
            },
         });
   }

   private initializeSwiper(): void {
      if (
         this.mainSwiper &&
         this.thumbsSwiper &&
         this.mainSwiper.nativeElement.swiper
      ) {
         const thumbsParams = {
            swiper: this.thumbsSwiper.nativeElement.swiper,
         };
         Object.assign(this.mainSwiper.nativeElement, { thumbs: thumbsParams });

         this.mainSwiper.nativeElement.swiper.update();
         this.thumbsSwiper.nativeElement.swiper.update();
      }
   }

   openZoom(rawUrl: string) {
      this.selectedImageForZoom = rawUrl;
   }

   closeZoom() {
      this.selectedImageForZoom = null;
   }
}
