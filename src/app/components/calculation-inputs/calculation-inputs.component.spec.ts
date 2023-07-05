import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CalculationInputsComponent } from './calculation-inputs.component';

describe('CalculationInputsComponent', () => {
  let component: CalculationInputsComponent;
  let fixture: ComponentFixture<CalculationInputsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CalculationInputsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculationInputsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
