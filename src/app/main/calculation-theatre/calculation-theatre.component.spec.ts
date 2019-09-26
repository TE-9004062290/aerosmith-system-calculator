import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculationTheatreComponent } from './calculation-theatre.component';

describe('CalculationTheatreComponent', () => {
  let component: CalculationTheatreComponent;
  let fixture: ComponentFixture<CalculationTheatreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalculationTheatreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculationTheatreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
