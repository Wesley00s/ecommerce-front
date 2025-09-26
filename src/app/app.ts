import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@Component({
   standalone: true,
   selector: 'app-root',
   imports: [RouterOutlet, NavbarComponent],
   templateUrl: './app.html',
   styleUrl: './app.sass',
})
export class App {
   protected title = 'Ecommerce-Front';
}
