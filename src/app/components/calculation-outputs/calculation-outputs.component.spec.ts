import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculationOutputsComponent } from './calculation-outputs.component';

describe('CalculationOutputsComponent', () => {
  let component: CalculationOutputsComponent;
  let fixture: ComponentFixture<CalculationOutputsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalculationOutputsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculationOutputsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
