import { Component, HostListener, OnDestroy } from '@angular/core';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { NAV_PATHS } from '../../../core/navigation/navigation.constant';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HideMenuComponent } from '../hide-menu/hide-menu.component';
import { BurgerButtonComponent } from '../burger-button/burger-button.component';

@Component({
   selector: 'app-navbar',
   imports: [
      NgOptimizedImage,
      RouterLink,
      RouterLinkActive,
      HideMenuComponent,
      BurgerButtonComponent,
      NgClass,
   ],
   templateUrl: './navbar.component.html',
   styleUrl: './navbar.component.sass',
})
export class NavbarComponent implements OnDestroy {
   protected logo = 'assets/images/logo.svg';
   protected cart = 'assets/images/cart.svg';
   protected profile = 'assets/images/profile.svg';
   protected logoAlt = 'Logo';
   protected cartAlt = 'Cart';
   protected profileAlt = 'Profile';
   protected navPaths = NAV_PATHS;

   protected isOpen = false;

   toggleMenu() {
      this.isOpen = !this.isOpen;
   }

   private currentScroll = 0;
   protected isScrolling = false;
   private scrollTimeout!: ReturnType<typeof setTimeout> ;

   @HostListener('window:scroll', [])
   onWindowScroll() {
      this.currentScroll =
         window.pageYOffset ||
         document.documentElement.scrollTop ||
         document.body.scrollTop ||
         0;
      if (this.currentScroll >= 450 && !this.isOpen) {
         this.isScrolling = true;

         clearTimeout(this.scrollTimeout);

         this.scrollTimeout = setTimeout(() => {
            this.isScrolling = false;
         }, 800);
      }
   }

   ngOnDestroy() {
      clearTimeout(this.scrollTimeout);
   }
}
