import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CateorySlider } from './cateory-slider';

describe('CateorySlider', () => {
  let component: CateorySlider;
  let fixture: ComponentFixture<CateorySlider>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CateorySlider]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CateorySlider);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
