import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NAV_PATHS } from '../../../core/navigation/navigation.constant';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
   selector: 'app-hide-menu',
   imports: [NgOptimizedImage, RouterLink, RouterLinkActive, NgClass],
   templateUrl: './hide-menu.component.html',
   styleUrl: './hide-menu.component.sass',
})
export class HideMenuComponent {
   protected logo = 'assets/images/logo.svg';
   protected cart = 'assets/images/cart.svg';
   protected profile = 'assets/images/profile.svg';
   protected logoAlt = 'Logo';
   protected cartAlt = 'Cart';
   protected profileAlt = 'Profile';
   protected navPaths = NAV_PATHS;

   @Input() isOpen = false;
   @Output() toggleChange = new EventEmitter<void>();

   onClick() {
      this.toggleChange.emit();
   }
}
