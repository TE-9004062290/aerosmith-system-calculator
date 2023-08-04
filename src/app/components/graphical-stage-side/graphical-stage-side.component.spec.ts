import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GraphicalStageSideComponent } from './graphical-stage-side.component';

describe('GraphicalStageSideComponent', () => {
  let component: GraphicalStageSideComponent;
  let fixture: ComponentFixture<GraphicalStageSideComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GraphicalStageSideComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GraphicalStageSideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
