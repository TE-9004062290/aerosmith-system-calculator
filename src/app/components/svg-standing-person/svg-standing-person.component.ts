import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-svg-standing-person',
    templateUrl: './svg-standing-person.component.html',
    styleUrls: ['./svg-standing-person.component.scss'],
    standalone: false
})
export class SvgStandingPersonComponent implements OnInit {

  public static readonly FRONT_WIDTH_HEIGHT_RATIO = 0.3463406889982537;

  public static readonly SIDE_WIDTH_HEIGHT_RATIO = 0.1824858580491921;
  public static readonly SITTING_WIDTH_HEIGHT_RATIO = 0.56287356321;
  
  public static readonly TOP_WIDTH_HEIGHT_RATIO = 0.5385;
  public static readonly SITTING_TOP_WIDTH_HEIGHT_RATIO = 0.75393939393;

  @Input() width: string = "100%";
  @Input() height: string = "100%";
  @Input() mode: 'front' | 'side' | 'top' | 'sitting' | 'sitting-top' = 'front';
  
  constructor() { }

  ngOnInit() {
  }

}
