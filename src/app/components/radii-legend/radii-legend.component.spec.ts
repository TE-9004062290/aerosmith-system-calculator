import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiiLegendComponent } from './radii-legend.component';

describe('RadiiLegendComponent', () => {
  let component: RadiiLegendComponent;
  let fixture: ComponentFixture<RadiiLegendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RadiiLegendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RadiiLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
