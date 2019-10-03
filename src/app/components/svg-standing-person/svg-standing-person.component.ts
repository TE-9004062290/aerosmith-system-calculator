import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-svg-standing-person',
  templateUrl: './svg-standing-person.component.html',
  styleUrls: ['./svg-standing-person.component.scss']
})
export class SvgStandingPersonComponent implements OnInit {

  @Input() width: string = "100%";
  @Input() height: string = "100%";
  constructor() { }

  ngOnInit() {
  }

}
