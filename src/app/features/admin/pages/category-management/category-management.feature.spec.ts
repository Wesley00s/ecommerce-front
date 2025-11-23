import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryManagementFeature } from './category-management.feature';

describe('CategoryManagementFeature', () => {
   let component: CategoryManagementFeature;
   let fixture: ComponentFixture<CategoryManagementFeature>;

   beforeEach(async () => {
      await TestBed.configureTestingModule({
         imports: [CategoryManagementFeature],
      }).compileComponents();

      fixture = TestBed.createComponent(CategoryManagementFeature);
      component = fixture.componentInstance;
      fixture.detectChanges();
   });

   it('should create', () => {
      expect(component).toBeTruthy();
   });
});
