import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RadioToggleComponent } from './radio-toggle.component';

describe('RadioToggleComponent', () => {
  let component: RadioToggleComponent;
  let fixture: ComponentFixture<RadioToggleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RadioToggleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RadioToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
