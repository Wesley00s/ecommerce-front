import { Component, Input } from '@angular/core';

@Component({
   selector: 'app-info-container',
   imports: [],
   templateUrl: './info-container.component.html',
   styleUrl: './info-container.component.sass',
})
export class InfoContainerComponent {
   @Input({ required: true }) infoMessage!: string;
}
