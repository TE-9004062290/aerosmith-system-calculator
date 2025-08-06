import { Component, OnInit } from '@angular/core';
import AppVersionInfo from '@app/config/version.json';

@Component({
    selector: 'app-version-output',
    templateUrl: './version-output.component.html',
    styleUrls: ['./version-output.component.scss'],
    standalone: false
})
export class VersionOutputComponent implements OnInit {
  public versionNumber: string = AppVersionInfo.version;

  constructor() { }

  ngOnInit() {
  }

}
