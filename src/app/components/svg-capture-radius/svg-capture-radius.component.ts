import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-svg-capture-radius',
  templateUrl: './svg-capture-radius.component.html',
  styleUrls: ['./svg-capture-radius.component.scss']
})
export class SvgCaptureRadiusComponent implements OnInit {


  @Input() width: string = "100%";
  @Input() height: string = "100%";
  @Input() mode: 'presenterReinforcementQuality' | 'presenterReinforcementRange' | 'presenterRecording' | 'secondaryPresenterRecording' | 'audienceRecording' = 'audienceRecording';
  
  constructor() { }

  ngOnInit() {
  }

}
