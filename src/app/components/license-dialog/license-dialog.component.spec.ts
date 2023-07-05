import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LicenseDialogComponent } from './license-dialog.component';

describe('LicenseDialogComponent', () => {
  let component: LicenseDialogComponent;
  let fixture: ComponentFixture<LicenseDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LicenseDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LicenseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
