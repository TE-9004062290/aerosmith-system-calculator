import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DesignInputsComponent } from './design-inputs.component';

describe('DesignInputsComponent', () => {
  let component: DesignInputsComponent;
  let fixture: ComponentFixture<DesignInputsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DesignInputsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignInputsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
