import { Component, OnInit } from '@angular/core';
import { environment } from 'environments/environment';

@Component({
    selector: 'app-version-stamp',
    templateUrl: './version-stamp.component.html',
    styleUrls: ['./version-stamp.component.scss'],
    standalone: false
})
export class VersionStampComponent implements OnInit {

  public commitSHA = '';
  constructor() { }

  ngOnInit() {
    this.commitSHA = environment.commitSHA;
  }

  private zeroPad(leadingZeroes: number, num: number): string {
    const padding = '0'.repeat(leadingZeroes);
    return (padding + num).slice(-1 * leadingZeroes);
  }

  public get now() {
    return new Date();
  }

}
