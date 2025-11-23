import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductManagementFeature } from './product-management.feature';

describe('ProductManagementFeature', () => {
   let component: ProductManagementFeature;
   let fixture: ComponentFixture<ProductManagementFeature>;

   beforeEach(async () => {
      await TestBed.configureTestingModule({
         imports: [ProductManagementFeature],
      }).compileComponents();

      fixture = TestBed.createComponent(ProductManagementFeature);
      component = fixture.componentInstance;
      fixture.detectChanges();
   });

   it('should create', () => {
      expect(component).toBeTruthy();
   });
});
