import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFeature } from './search.feature';

describe('SearchFeature', () => {
   let component: SearchFeature;
   let fixture: ComponentFixture<SearchFeature>;

   beforeEach(async () => {
      await TestBed.configureTestingModule({
         imports: [SearchFeature],
      }).compileComponents();

      fixture = TestBed.createComponent(SearchFeature);
      component = fixture.componentInstance;
      fixture.detectChanges();
   });

   it('should create', () => {
      expect(component).toBeTruthy();
   });
});
