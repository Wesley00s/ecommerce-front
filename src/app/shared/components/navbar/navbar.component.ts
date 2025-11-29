import { Component, computed, inject, OnInit } from '@angular/core';
import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import { NAV_PATHS } from '../../../core/navigation/navigation.constant';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { HideMenuComponent } from '../hide-menu/hide-menu.component';
import { BurgerButtonComponent } from '../burger-button/burger-button.component';
import { AuthService } from '../../../core/services/auth.service';
import { UserType } from '../../../core/enum/UserType';
import { CartService } from '../../../core/services/cart.service';
import { map, Observable } from 'rxjs';
import { ItemStatus } from '../../../core/enum/ItemStatus';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
   selector: 'app-navbar',
   imports: [
      RouterLink,
      RouterLinkActive,
      HideMenuComponent,
      BurgerButtonComponent,
      NgOptimizedImage,
      AsyncPipe,
      ReactiveFormsModule,
   ],
   templateUrl: './navbar.component.html',
   styleUrl: './navbar.component.sass',
})
export class NavbarComponent implements OnInit {
   protected logo = 'assets/images/logo.svg';
   protected cart = 'assets/images/cart.svg';
   protected profile = 'assets/images/profile.svg';
   protected logoAlt = 'Logo';
   protected cartAlt = 'Cart';
   protected profileAlt = 'Profile';
   protected navPaths = NAV_PATHS;
   private authService = inject(AuthService);
   private cartService = inject(CartService);
   private router = inject(Router);

   searchControl = new FormControl('');

   selectedItemsCount$!: Observable<number>;

   protected isOpen = false;
   protected isSearchOpen = false;

   toggleMenu() {
      this.isOpen = !this.isOpen;
      if (this.isOpen) this.isSearchOpen = false;
   }

   toggleSearch() {
      this.isSearchOpen = !this.isSearchOpen;
      if (this.isSearchOpen) this.isOpen = false;
   }

   protected userInitials = this.authService.userInitials;

   protected isAdmin = computed(() => {
      const currentUser = this.authService.currentUser();
      return currentUser?.userType === UserType.ADMIN;
   });

   protected isLogged = this.authService.isLogged;

   protected profileLink = computed(() => {
      return this.isLogged() ? '/profile' : '/sign-in';
   });

   protected profileTitle = computed(() => {
      return this.isLogged() ? 'Navegar para perfil' : 'Navegar para login';
   });

   ngOnInit() {
      this.selectedItemsCount$ = this.cartService.cart$.pipe(
         map((cart) => {
            if (!cart || !cart.items) return 0;
            const activeItems = cart.items.filter(
               (i) => i.status === ItemStatus.PENDING,
            );
            return activeItems.length;
         }),
      );

      if (this.isLogged()) {
         this.cartService.getCart().subscribe();
      }
   }

   onSearch() {
      const query = this.searchControl.value;

      if (query && query.trim().length > 0) {
         this.router.navigate(['/search'], {
            queryParams: { q: query },
         });

         this.isSearchOpen = false;

         if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
         }
      }
   }

   clearSearch() {
      this.searchControl.setValue('');
   }
}
