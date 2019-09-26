import { Component, OnInit, ComponentFactoryResolver } from '@angular/core';

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

  public ceilingHeight: number = 0;
  public lectureWidth: number = 0;
  public measurementUnit: MeasurementUnits = MeasurementUnits.Meters;

  ngOnInit() {

  }

  onUnitChange(unit) {
    if (unit === MeasurementUnits.Meters) {
      this.ceilingHeight /= 5;
      this.lectureWidth /= 5;
    } else if (MeasurementUnits.Feet) {
      this.ceilingHeight *= 5;
      this.lectureWidth *= 5;
    }
  }

}
