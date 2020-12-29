import { Injectable } from '@angular/core';
import * as mixpanel from 'mixpanel-browser';

import { CalculatorService } from './calculator.service';

// declare var require: any;
// const mixpanel = require('mixpanel-browser');

@Injectable({
  providedIn: 'root'
})
export class MixpanelService {

  constructor(private calculatorService: CalculatorService) {
    mixpanel.init("d50ba5898aa049f78fdad4e512104772");
  }

  trackCalculation() {
    const cService = this.calculatorService;
    let toTrack = {
      'Measurement Units': cService.measurementUnit.toString(),
      "Calculation Priority": cService.soundReinforcementPriority.toString(),
      "Ceiling Height": cService.ceilingHeight,
      "Presentation Area Width": cService.lectureWidth,
      "Presenter Height": cService.presenterHeight,
      "Audience Height": cService.audienceHeight,
      "Number of Microphones": cService.requiredMicrophones,
      "Distance between Microphones": cService.microphoneInterval,
      "Distance between Microphones and Audience": cService.audienceDistance,
      "Minimum Extender Length Required": cService.extenderLength
    };

    if (cService.extenderProvided) {
      toTrack['User-provided Extender Length'] = cService.inputExtenderLength;
    }

    mixpanel.track("Speech Reinforcement Calculation", toTrack);
  }
}
