import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { VersionOutputComponent } from './version-output.component';

describe('VersionOutputComponent', () => {
  let component: VersionOutputComponent;
  let fixture: ComponentFixture<VersionOutputComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VersionOutputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VersionOutputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
