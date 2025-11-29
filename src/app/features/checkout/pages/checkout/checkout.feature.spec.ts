import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutFeature } from './checkout.feature';

describe('CheckoutFeature', () => {
   let component: CheckoutFeature;
   let fixture: ComponentFixture<CheckoutFeature>;

   beforeEach(async () => {
      await TestBed.configureTestingModule({
         imports: [CheckoutFeature],
      }).compileComponents();

      fixture = TestBed.createComponent(CheckoutFeature);
      component = fixture.componentInstance;
      fixture.detectChanges();
   });

   it('should create', () => {
      expect(component).toBeTruthy();
   });
});
