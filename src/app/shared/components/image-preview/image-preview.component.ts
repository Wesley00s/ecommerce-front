import {
   Component,
   EventEmitter,
   HostListener,
   Input,
   Output,
   signal,
} from '@angular/core';

@Component({
   selector: 'app-image-preview',
   imports: [],
   templateUrl: './image-preview.component.html',
   styleUrl: './image-preview.component.sass',
})
export class ImagePreviewComponent {
   @Input({ required: true }) imageSrc!: string;
   @Input() altText = 'Imagem ampliada';
   @Output() imageClose = new EventEmitter<void>();

   scale = signal(1);
   panning = signal({ x: 0, y: 0 });

   private isDragging = false;
   private startPoint = { x: 0, y: 0 };

   zoomIn() {
      this.scale.update((v) => Math.min(v + 0.5, 4));
   }

   zoomOut() {
      this.scale.update((v) => {
         const newVal = Math.max(v - 0.5, 1);
         if (newVal === 1) this.resetPosition();
         return newVal;
      });
   }

   resetZoom() {
      this.scale.set(1);
      this.resetPosition();
   }

   private resetPosition() {
      this.panning.set({ x: 0, y: 0 });
   }

   onMouseDown(event: MouseEvent | TouchEvent) {
      if (this.scale() <= 1) return;
      this.isDragging = true;
      const clientX =
         event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
      const clientY =
         event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;

      this.startPoint = {
         x: clientX - this.panning().x,
         y: clientY - this.panning().y,
      };

      event.preventDefault();
   }

   @HostListener('document:mousemove', ['$event'])
   @HostListener('document:touchmove', ['$event'])
   onMouseMove(event: MouseEvent | TouchEvent) {
      if (!this.isDragging) return;

      const clientX =
         event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
      const clientY =
         event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;

      this.panning.set({
         x: clientX - this.startPoint.x,
         y: clientY - this.startPoint.y,
      });
   }

   @HostListener('document:mouseup')
   @HostListener('document:touchend')
   onMouseUp() {
      this.isDragging = false;
   }

   @HostListener('document:keydown.escape')
   onEscape() {
      this.imageClose.emit();
   }
}
