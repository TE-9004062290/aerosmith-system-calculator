import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-svg-icons',
  templateUrl: './svg-icons.component.html',
  styleUrls: ['./svg-icons.component.scss']
})
export class SvgIconsComponent implements OnInit {

  constructor() { }

  @Input() iconType: 'warning' | 'info' | 'toggle' = 'warning';
  @Input() transformString: string = undefined;
  ngOnInit() {
  }

}
