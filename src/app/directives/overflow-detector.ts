import {
   Directive,
   ElementRef,
   AfterViewInit,
   Output,
   EventEmitter,
   HostListener,
   inject,
} from '@angular/core';

@Directive({
   selector: '[appOverflowDetector]',
   standalone: true,
})
export class OverflowDetectorDirective implements AfterViewInit {
   @Output() isOverflowing = new EventEmitter<boolean>();
   private clampLines = 2;

   private elementRef = inject(ElementRef<HTMLElement>);

   ngAfterViewInit(): void {
      setTimeout(() => this.checkOverflow(), 100);
   }

   @HostListener('window:resize')
   onResize(): void {
      this.checkOverflow();
   }

   private checkOverflow(): void {
      const element = this.elementRef.nativeElement;

      const style = window.getComputedStyle(element);
      const lineHeight = parseFloat(style.lineHeight);

      const maxHeight = lineHeight * this.clampLines;
      const hasOverflow = element.scrollHeight > maxHeight + 0.1;

      this.isOverflowing.emit(hasOverflow);
   }
}
