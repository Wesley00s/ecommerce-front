import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsDetailsFeature } from './products-details.feature';

describe('ProductsDetailsFeature', () => {
   let component: ProductsDetailsFeature;
   let fixture: ComponentFixture<ProductsDetailsFeature>;

   beforeEach(async () => {
      await TestBed.configureTestingModule({
         imports: [ProductsDetailsFeature],
      }).compileComponents();

      fixture = TestBed.createComponent(ProductsDetailsFeature);
      component = fixture.componentInstance;
      fixture.detectChanges();
   });

   it('should create', () => {
      expect(component).toBeTruthy();
   });
});
