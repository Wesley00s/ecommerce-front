import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProductCategoryResponse } from '../../../../core/@types/ProductCategoryResponse';
import { NgOptimizedImage } from '@angular/common';

@Component({
   selector: 'app-category-table',
   imports: [NgOptimizedImage],
   templateUrl: './category-table.component.html',
   styleUrl: './category-table.component.sass',
})
export class CategoryTableComponent {
   @Input({ required: true }) categories: ProductCategoryResponse[] = [];
   @Output() edit = new EventEmitter<ProductCategoryResponse>();
   @Output() delete = new EventEmitter<number>();
}
