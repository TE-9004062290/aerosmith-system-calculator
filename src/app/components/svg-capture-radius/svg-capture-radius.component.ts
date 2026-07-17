import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-svg-capture-radius',
    templateUrl: './svg-capture-radius.component.html',
    styleUrls: ['./svg-capture-radius.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SvgCaptureRadiusComponent implements OnInit {


  @Input() width: number = 0;
  @Input() height: number = 0;
  @Input() mode: 'presenterReinforcementQuality' | 'presenterReinforcementRange' | 'presenterRecording' | 'secondaryPresenterRecording' | 'audienceRecording' = 'audienceRecording';
  @Input() displayRadius: boolean = true;
  
  constructor() { }

  ngOnInit() {
  }

}
