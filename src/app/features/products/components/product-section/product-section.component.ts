import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../../../core/@types/Product';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';
import { RouterLink } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorContainerComponent } from '../../../../shared/components/error-container/error-container.component';

@Component({
   selector: 'app-product-section',
   imports: [
      ProductCardComponent,
      RouterLink,
      LoadingSpinnerComponent,
      ErrorContainerComponent,
   ],
   templateUrl: './product-section.component.html',
   styleUrl: './product-section.component.sass',
})
export class ProductSectionComponent {
   @Input() sectionId = '';
   @Input() title = '';
   @Input() subtitle = '';
   @Input() viewAllLink: string | null = null;

   @Input() products: Product[] = [];
   @Input() loading = false;
   @Input() loadingMore = false;
   @Input() loadingMessage = 'Carregando produtos...';

   @Input() error = false;
   @Input() errorMessage = 'Erro ao carregar produtos.';

   @Input() hasMorePages = false;

   @Output() loadMore = new EventEmitter<void>();

   onLoadMore(): void {
      this.loadMore.emit();
   }
}
