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
      "Audience Depth": cService.audienceDepth,
      "Presenter Height": cService.presenterHeight,
      "Audience Height": cService.audienceHeight,
      "Number of Microphones (Presenter)": cService.requiredMicrophones,
      "Distance between Microphones (Presenter)": cService.microphoneInterval,
      "Distance between Microphones and Audience (Presenter)": cService.audienceDistance,
      "Minimum Extender Length Required (Presenter)": cService.inputExtenderMinimum,
      "Number of Microphones along Depth (Audience)": cService.requiredAudienceMicrophonesDepth,
      "Distance between Microphones along Depth (Audience)": cService.audienceMicrophoneIntervalDepth,
      "Number of Microphones along Width (Audience)": cService.requiredAudienceMicrophonesWidth,
      "Distance between Microphones along Width (Audience)": cService.audienceMicrophoneIntervalWidth,
      "Minimum Extender Length Required (Audience)": cService.inputAudienceExtenderMinimum,
    };

    if (cService.extenderProvided) {
      toTrack['User-provided Extender Length (Presenter)'] = cService.inputExtenderLength;
    }

    if (cService.audienceExtenderProvided) {
      toTrack['User-provided Extender Length (Audience)'] = cService.inputAudienceExtenderLength;
    }

    mixpanel.track("Speech Reinforcement Calculation", toTrack);
  }
}
