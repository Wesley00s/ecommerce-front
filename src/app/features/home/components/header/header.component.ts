import { Component } from '@angular/core';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { NgOptimizedImage } from '@angular/common';

@Component({
   selector: 'app-header',
   imports: [ButtonComponent, NgOptimizedImage],
   templateUrl: './header.component.html',
   styleUrl: './header.component.sass',
})
export class HeaderComponent {
   protected phone = 'assets/images/phone.svg';
   protected phoneAlt = 'Phone';

   onButtonClick() {
      return
   }
}
