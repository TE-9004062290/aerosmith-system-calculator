import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CalculatorService } from '@app/services/calculator.service';

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

  constructor(
    private activatedRoute: ActivatedRoute,
    public calculatorService: CalculatorService) {} 

  ngOnInit() {
    this.activatedRoute.queryParams
    .subscribe(params => {
      if (!this.initialized) {
        this.parseParams(params);
        this.calculate();
        this.initialized = true;
      }
    });
  }

  private parseParams(params) {
    const { ceilingHeight, lectureWidth, presenterHeight, audienceHeight, inputExtenderLength, measurementUnit, priority } = params;

    switch (measurementUnit) {
      case 'ft':
        this.calculatorService.measurementUnit = MeasurementUnits.Feet;
        break;
      case 'm':
        this.calculatorService.measurementUnit = MeasurementUnits.Meters;
    }

    if (ceilingHeight) this.calculatorService.ceilingHeight = ceilingHeight;
    if (lectureWidth) this.calculatorService.lectureWidth = lectureWidth;
    if (presenterHeight) this.calculatorService.presenterHeight = presenterHeight;
    if (audienceHeight) this.calculatorService.audienceHeight = audienceHeight;
    if (inputExtenderLength) this.calculatorService.inputExtenderLength = inputExtenderLength;

    switch (priority) {
      case 0:
      case '0':
        this.calculatorService.calculationPriority = CalculationPriority.AudioQuality;
        break;
      case 1:
      case '1':
        this.calculatorService.calculationPriority = CalculationPriority.CaptureArea;
        break;
    }
  }

  calculate() {
    this.calculatorService.calculateOutputs();
    this.calculatorService.$recalculate.next(true);
  }
}
