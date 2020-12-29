import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


import { CalculatorService } from '@app/services/calculator.service';
import { MixpanelService } from '@app/services/mixpanel.service';

import { environment } from 'environments/environment';

import {
  trigger,
  style,
  animate,
  transition,
} from '@angular/animations';

import { MeasurementUnits } from '@app/models/enums/measurement-units.enum';
import { SoundReinforcementPriority } from '@app/models/enums/sound-reinforcement-priority.enum';

@Component({
  selector: 'app-calculation-theatre',
  templateUrl: './calculation-theatre.component.html',
  styleUrls: ['./calculation-theatre.component.scss']
})
export class CalculationTheatreComponent implements OnInit {

  private initialized = false;

  public MeasurementUnitsEnum = MeasurementUnits;
  public SoundReinforcementPriorityEnum = SoundReinforcementPriority;

  public measurementUnit: MeasurementUnits = MeasurementUnits.Meters;
  public soundReinforcementPriority: SoundReinforcementPriority = SoundReinforcementPriority.AudioQuality;

  public sideBarOut = false;
  
  constructor(
    private activatedRoute: ActivatedRoute,
    public calculatorService: CalculatorService,
    public mixpanelService: MixpanelService) {} 

  ngOnInit() {
    this.activatedRoute.queryParams
    .subscribe(params => {
      if (!this.initialized) {
        const hasParam = this.parseParams(params);
        if (hasParam) {
          this.calculate(false);
        }
        this.initialized = true;
      }
    });
  }

  public calculate(track: boolean = false) {
    this.calculatorService.calculateOutputs();
    this.calculatorService.$recalculate.next(true);
    this.hideSideBar();
    
    if (environment.production && track) {
      this.mixpanelService.trackCalculation();
    }
  }

  public toggleSideBar() {
    this.sideBarOut = !this.sideBarOut;
  }

  public hideSideBar() {
    this.sideBarOut = false;
  }

  private parseParams(params) {
    const { 
      ceilingHeight, lectureWidth, presenterHeight, audienceHeight, audienceDepth,
      inputExtenderLength, measurementUnit, 
      reinforcePresenter, recordPresenter, recordAudience, reinforcementPriority } = params;

    let hasParam: boolean = false;
    switch (measurementUnit) {
      case 'ft':
        this.calculatorService.measurementUnit = MeasurementUnits.Feet;
        hasParam = true;
        break;
      case 'm':
        this.calculatorService.measurementUnit = MeasurementUnits.Meters;
        hasParam = true;
        break;
    }

    if (ceilingHeight) {
      this.calculatorService.ceilingHeight = ceilingHeight;
      hasParam = true;
    }
    if (lectureWidth) {
      this.calculatorService.lectureWidth = lectureWidth;
      hasParam = true;
    }
    if (presenterHeight) {
      this.calculatorService.presenterHeight = presenterHeight;
      hasParam = true;
    }
    if (audienceHeight) {
      this.calculatorService.audienceHeight = audienceHeight;
      hasParam = true;
    }
    if (audienceDepth) {
      this.calculatorService.audienceDepth = audienceDepth;
      hasParam = true;
    }
    if (inputExtenderLength) {
      this.calculatorService.inputExtenderLength = inputExtenderLength;
      hasParam = true;
    }

    if (reinforcePresenter) {
      this.calculatorService.reinforcePresenter = !!(+reinforcePresenter);
      hasParam = true;
    }

    if (recordPresenter) {
      this.calculatorService.recordPresenter = !!(+recordPresenter);
      hasParam = true;
    }

    if (recordAudience) {
      this.calculatorService.recordAudience = !!(+recordAudience);
      hasParam = true;
    }

    switch (reinforcementPriority) {
      case 0:
      case '0':
        this.calculatorService.soundReinforcementPriority = SoundReinforcementPriority.AudioQuality;
        hasParam = true;
        break;
      case 1:
      case '1':
        this.calculatorService.soundReinforcementPriority = SoundReinforcementPriority.DetectionRange;
        hasParam = true;
        break;
    }

    return hasParam;
  }
}
