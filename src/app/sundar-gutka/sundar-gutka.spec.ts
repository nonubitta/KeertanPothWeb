import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SundarGutka } from './sundar-gutka';

describe('SundarGutka', () => {
  let component: SundarGutka;
  let fixture: ComponentFixture<SundarGutka>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SundarGutka]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SundarGutka);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
