import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';

@Component({
   selector: 'app-page',
   imports: [NgClass, DatePipe],
   templateUrl: './profile.feature.html',
   styleUrl: './profile.feature.sass',
})
export class ProfileFeature implements OnInit {
   private authService = inject(AuthService);
   private router = inject(Router);

   currentUser = this.authService.currentUser;
   protected userInitials = this.authService.userInitials;

   ngOnInit(): void {
      this.authService.getAuthenticatedUser().subscribe({
         error: () => {
            this.router.navigate(['/login']);
         }
      });
   }

   logout(): void {
      this.authService.logout().subscribe({
         next: () => {
            this.router.navigate(['/']);
         },
      });
   }
}
