import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-svg-icons',
    templateUrl: './svg-icons.component.html',
    styleUrls: ['./svg-icons.component.scss'],
    standalone: false
})
export class SvgIconsComponent implements OnInit {

  constructor() { }

  @Input() iconType: 'warning' | 'info' | 'toggle' | 'radio-on' | 'radio-off' = 'warning';
  @Input() width: number;
  @Input() height: number;
  @Input() primaryFill: string = '#757575';
  @Input() transformString: string = undefined;
  ngOnInit() {
  }

}
