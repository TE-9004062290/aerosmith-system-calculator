import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { VersionStampComponent } from './version-stamp.component';

describe('VersionStampComponent', () => {
  let component: VersionStampComponent;
  let fixture: ComponentFixture<VersionStampComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VersionStampComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VersionStampComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
