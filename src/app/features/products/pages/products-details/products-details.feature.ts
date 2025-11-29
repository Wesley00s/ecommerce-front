import { Component, inject, OnInit } from '@angular/core';
import { ProductDetailsComponent } from '../../components/product-details/product-details.component';
import { ReviewsComponent } from '../../components/reviews/reviews.component';
import { ActivatedRoute } from '@angular/router';
import {
   ProductService,
   ProductState,
} from '../../../../core/services/product.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { InfoContainerComponent } from '../../../../shared/components/info-container/info-container.component';
import { LoadingContainerComponent } from '../../../../shared/components/loading-container/loading-container.component';

@Component({
   selector: 'app-products-details',
   imports: [
      ProductDetailsComponent,
      ReviewsComponent,
      AsyncPipe,
      InfoContainerComponent,
      LoadingContainerComponent,
   ],
   templateUrl: './products-details.feature.html',
   styleUrl: './products-details.feature.sass',
})
export class ProductsDetailsFeature implements OnInit {
   protected route = inject(ActivatedRoute);
   protected productService = inject(ProductService);
   protected productCode!: string;

   readonly productState$: Observable<ProductState> =
      this.productService.productState$;

   ngOnInit(): void {
      this.productCode = this.route.snapshot.paramMap.get('code')!;
      this.productService.getProductByCode(this.productCode);
   }
}
