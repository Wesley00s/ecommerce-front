import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
   selector: 'app-loading-spinner',
   imports: [NgClass],
   templateUrl: './loading-spinner.component.html',
   styleUrl: './loading-spinner.component.sass',
})
export class LoadingSpinnerComponent {
   @Input() message = 'Carregando...';
   @Input() colorClass = 'text-orange-base';
   @Input() textColorClass = 'text-gray-600';
   @Input() sizeClass = 'h-6 w-6 md:h-8 md:w-8';
   @Input() containerClass = 'py-8';
}
