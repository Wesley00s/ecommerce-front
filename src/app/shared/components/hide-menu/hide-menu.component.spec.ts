import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HideMenuComponent } from './hide-menu.component';

describe('HideMenuComponent', () => {
   let component: HideMenuComponent;
   let fixture: ComponentFixture<HideMenuComponent>;

   beforeEach(async () => {
      await TestBed.configureTestingModule({
         imports: [HideMenuComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(HideMenuComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
   });

   it('should create', () => {
      expect(component).toBeTruthy();
   });
});
