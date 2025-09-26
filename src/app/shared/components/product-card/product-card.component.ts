import { Component, Input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StarsComponent } from '../stars/stars.component';
import {ToRelativePathPipe} from '../../pipes/to-relative-path.pipe';

@Component({
   selector: 'app-product-card',
   imports: [NgOptimizedImage, RouterLink, StarsComponent, ToRelativePathPipe],
   templateUrl: './product-card.component.html',
   styleUrl: './product-card.component.sass',
})
export class ProductCardComponent {
   @Input() productId = 0;
   @Input() productImage?: string | null = null;
   @Input() productTitle = '';
   @Input() productDescription = '';
   @Input() productPrice = 0.0;
   @Input() productRating = 0.0;
   @Input() totalSold = 0;
}
