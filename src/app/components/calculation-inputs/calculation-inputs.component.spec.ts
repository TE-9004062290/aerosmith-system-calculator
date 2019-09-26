import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculationInputsComponent } from './calculation-inputs.component';

describe('CalculationInputsComponent', () => {
  let component: CalculationInputsComponent;
  let fixture: ComponentFixture<CalculationInputsComponent>;

  beforeEach(async(() => {
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
