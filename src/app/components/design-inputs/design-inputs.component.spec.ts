import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignInputsComponent } from './design-inputs.component';

describe('DesignInputsComponent', () => {
  let component: DesignInputsComponent;
  let fixture: ComponentFixture<DesignInputsComponent>;

  beforeEach(async(() => {
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
