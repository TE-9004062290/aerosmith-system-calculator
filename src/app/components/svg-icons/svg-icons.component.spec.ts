import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SvgIconsComponent } from './svg-icons.component';

describe('SvgIconsComponent', () => {
  let component: SvgIconsComponent;
  let fixture: ComponentFixture<SvgIconsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SvgIconsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SvgIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
