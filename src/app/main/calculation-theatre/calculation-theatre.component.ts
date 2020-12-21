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
import { CalculationPriority } from '@app/models/enums/calculation-priority.enums';

@Component({
  selector: 'app-calculation-theatre',
  templateUrl: './calculation-theatre.component.html',
  styleUrls: ['./calculation-theatre.component.scss']
})
export class CalculationTheatreComponent implements OnInit {

  private initialized = false;

  public MeasurementUnitsEnum = MeasurementUnits;
  public CalculationPriorityEnum = CalculationPriority;

  public measurementUnit: MeasurementUnits = MeasurementUnits.Meters;
  public calculationPriority: CalculationPriority = CalculationPriority.AudioQuality;

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
      inputExtenderLength, measurementUnit, priority } = params;
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
    }
    if (inputExtenderLength) {
      this.calculatorService.inputExtenderLength = inputExtenderLength;
      hasParam = true;
    }

    switch (priority) {
      case 0:
      case '0':
        this.calculatorService.calculationPriority = CalculationPriority.AudioQuality;
        hasParam = true;
        break;
      case 1:
      case '1':
        this.calculatorService.calculationPriority = CalculationPriority.CaptureArea;
        hasParam = true;
        break;
    }

    return hasParam;
  }
}
