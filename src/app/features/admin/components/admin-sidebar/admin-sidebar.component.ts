import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
   selector: 'app-admin-sidebar',
   imports: [RouterLink, RouterLinkActive],
   templateUrl: './admin-sidebar.component.html',
   styleUrl: './admin-sidebar.component.sass',
})
export class AdminSidebarComponent {}
