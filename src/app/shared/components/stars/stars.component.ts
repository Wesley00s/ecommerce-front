import { Component, computed, Input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
   selector: 'app-stars',
   imports: [NgOptimizedImage],
   templateUrl: './stars.component.html',
   styleUrl: './stars.component.sass',
})
export class StarsComponent {
   @Input() productRating = 0.0;

   starsArray = computed(() => {
      const rating = Math.min(5, Math.max(0, this.productRating));
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;

      const stars: string[] = [];

      for (let i = 0; i < fullStars; i++) {
         stars.push('full');
      }

      if (hasHalfStar && stars.length < 5) {
         stars.push('half');
      }

      while (stars.length < 5) {
         stars.push('empty');
      }

      return stars;
   });
}
