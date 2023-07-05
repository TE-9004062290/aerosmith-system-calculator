import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MeasuringStickComponent } from './measuring-stick.component';

describe('MeasuringStickComponent', () => {
  let component: MeasuringStickComponent;
  let fixture: ComponentFixture<MeasuringStickComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MeasuringStickComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeasuringStickComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
