import { Component, HostBinding, inject, Input } from '@angular/core';
import { Toast } from '../../../core/@types/Toast';
import { trigger, transition, style, animate } from '@angular/animations';
import { ToastService } from '../../../core/services/toast.service';
import { NgClass, NgOptimizedImage } from '@angular/common';

@Component({
   selector: 'app-toast',
   standalone: true,
   imports: [NgClass, NgOptimizedImage],
   templateUrl: './toast.component.html',
   styleUrl: './toast.component.sass',
   animations: [
      trigger('toastAnimation', [
         transition(':enter', [
            style({ transform: 'translateX(110%)', opacity: 0 }),
            animate(
               '300ms ease-out',
               style({ transform: 'translateX(0)', opacity: 1 }),
            ),
         ]),
         transition(':leave', [
            animate(
               '300ms ease-in',
               style({ transform: 'translateX(110%)', opacity: 0 }),
            ),
         ]),
      ]),
   ],
})
export class ToastComponent {
   @Input({ required: true }) toast!: Toast;

   @HostBinding('@toastAnimation')
   public readonly animation = true;

   private toastService = inject(ToastService);

   public toastClose(): void {
      this.toastService.removeToast(this.toast.id);
   }
}
