import { Component, OnInit } from '@angular/core';
import { version } from '@app/config/version.json';

@Component({
  selector: 'app-version-output',
  templateUrl: './version-output.component.html',
  styleUrls: ['./version-output.component.scss']
})
export class VersionOutputComponent implements OnInit {
  public versionNumber: string = version;

  constructor() { }

  ngOnInit() {
  }

}
