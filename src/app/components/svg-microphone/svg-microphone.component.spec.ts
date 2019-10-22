import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SvgMicrophoneComponent } from './svg-microphone.component';

describe('SvgMicrophoneComponent', () => {
  let component: SvgMicrophoneComponent;
  let fixture: ComponentFixture<SvgMicrophoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SvgMicrophoneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SvgMicrophoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
