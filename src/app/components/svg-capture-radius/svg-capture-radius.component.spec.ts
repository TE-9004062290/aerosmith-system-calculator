import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SvgCaptureRadiusComponent } from './svg-capture-radius.component';

describe('SvgCaptureRadiusComponent', () => {
  let component: SvgCaptureRadiusComponent;
  let fixture: ComponentFixture<SvgCaptureRadiusComponent>;

  beforeEach(async(() => {
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
