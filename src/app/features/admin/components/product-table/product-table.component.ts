import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../../../core/@types/Product';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
   selector: 'app-product-table',
   imports: [CurrencyPipe, NgOptimizedImage, RouterLink],
   templateUrl: './product-table.component.html',
   styleUrl: './product-table.component.sass',
})
export class ProductTableComponent {
   @Input({ required: true }) products: Product[] = [];
   @Output() edit = new EventEmitter<Product>();
   @Output() delete = new EventEmitter<number>();
}
