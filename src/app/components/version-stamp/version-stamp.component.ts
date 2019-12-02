import { Component, OnInit } from '@angular/core';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-version-stamp',
  templateUrl: './version-stamp.component.html',
  styleUrls: ['./version-stamp.component.scss']
})
export class VersionStampComponent implements OnInit {

  public commitSHA = '';
  constructor() { }

  ngOnInit() {
    this.commitSHA = environment.commitSHA;
  }

}
