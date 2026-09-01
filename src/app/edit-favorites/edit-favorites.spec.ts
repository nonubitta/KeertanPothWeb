import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFavorites } from './edit-favorites';

describe('EditFavorites', () => {
  let component: EditFavorites;
  let fixture: ComponentFixture<EditFavorites>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditFavorites]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditFavorites);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
