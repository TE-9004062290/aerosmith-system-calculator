import { Injectable } from '@angular/core';

import { SvgStandingPersonComponent } from '@app/components/svg-standing-person/svg-standing-person.component';

@Injectable({
  providedIn: 'root'
})
export class GraphicsService {

  constructor() { 

  }

  public get presenterWidthHeight() {
    return SvgStandingPersonComponent.FRONT_WIDTH_HEIGHT_RATIO;
  }
  
}
