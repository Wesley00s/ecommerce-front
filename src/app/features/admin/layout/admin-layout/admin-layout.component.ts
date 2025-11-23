import { Component } from '@angular/core';
import { AdminSidebarComponent } from '../../components/admin-sidebar/admin-sidebar.component';
import { RouterOutlet } from '@angular/router';

@Component({
   selector: 'app-admin-layout',
   imports: [AdminSidebarComponent, RouterOutlet],
   templateUrl: './admin-layout.component.html',
   styleUrl: './admin-layout.component.sass',
})
export class AdminLayoutComponent {}
