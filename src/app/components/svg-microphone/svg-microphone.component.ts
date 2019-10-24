import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-svg-microphone',
  templateUrl: './svg-microphone.component.html',
  styleUrls: ['./svg-microphone.component.scss']
})
export class SvgMicrophoneComponent implements OnInit {

  public static readonly WIDTH_HEIGHT_RATIO = 0.3463406889982537;

  @Input() extenderLength: number = 0;

  constructor() { }

  ngOnInit() {
  }
}

