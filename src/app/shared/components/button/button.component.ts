import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass, NgOptimizedImage } from '@angular/common';

@Component({
   selector: 'app-button',
   imports: [NgClass, NgOptimizedImage],
   templateUrl: './button.component.html',
   styleUrl: './button.component.sass',
})
export class ButtonComponent {
   @Input() label!: string;
   @Input() type: 'button' | 'submit' | 'reset' = 'button';
   @Input() disabled = false;
   @Input() color = 'bg-blue-base';
   @Input() hover = 'hover:bg-blue-dark';
   @Input() icon!: string;
   @Input() shadow = 'shadow-sm';

   @Output() clicked = new EventEmitter<void>();

   onClick() {
      if (!this.disabled) {
         this.clicked.emit();
      }
   }
}
