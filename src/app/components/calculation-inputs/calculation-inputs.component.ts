import { Component, OnInit, ComponentFactoryResolver } from '@angular/core';

import { convertMetersToFeet, convertFeetToMeters } from '@app/helpers/unit-conversion.helper';

export enum MeasurementUnits {
  Meters = "m",
  Feet = "ft"
}

@Component({
  selector: 'app-calculation-inputs',
  templateUrl: './calculation-inputs.component.html',
  styleUrls: ['./calculation-inputs.component.scss']
})
export class CalculationInputsComponent implements OnInit {

  constructor() { }

  public MeasurementUnitsEnum = MeasurementUnits;

  public measurementUnit: MeasurementUnits = MeasurementUnits.Meters;
  public ceilingHeight: number = 0;
  public lectureWidth: number = 0;
  public presenterHeight: number = 0;
  public audienceHeight: number = 0;


  ngOnInit() {

  }

  /* This makes the potentially dangerous assumption that the previous unit has
   * actually changed
   */
  onUnitChange(measurementUnit: MeasurementUnits) {
    const conversionFunc: Function = ((unit) => {
      switch (unit) {
        case MeasurementUnits.Meters:
          return convertFeetToMeters;
        case MeasurementUnits.Feet:
          return convertMetersToFeet;
      }
    })(measurementUnit);
    this.ceilingHeight = conversionFunc(this.ceilingHeight);
    this.lectureWidth = conversionFunc(this.lectureWidth);
    this.presenterHeight = conversionFunc(this.presenterHeight);
    this.audienceHeight = conversionFunc(this.audienceHeight);
  }
}
