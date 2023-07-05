import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SvgCaptureRadiusComponent } from './svg-capture-radius.component';

describe('SvgCaptureRadiusComponent', () => {
  let component: SvgCaptureRadiusComponent;
  let fixture: ComponentFixture<SvgCaptureRadiusComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SvgCaptureRadiusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SvgCaptureRadiusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
