import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { CalculationInputs } from '@app/models/calculation-inputs.model';
import { CalculationOutputs } from '@app/models/calculation-outputs.model';
import { MeasurementUnits } from '@app/models/enums/measurement-units.enum';


@Component({
  selector: 'app-calculation-inputs',
  templateUrl: './calculation-inputs.component.html',
  styleUrls: ['./calculation-inputs.component.scss']
})
export class CalculationInputsComponent implements OnInit {

  constructor() { }

  public MeasurementUnitsEnum = MeasurementUnits;

  public measurementUnit: MeasurementUnits = MeasurementUnits.Meters;
  public inputGroup: CalculationInputs = new CalculationInputs();

  @Output() onUnitChange: EventEmitter<CalculationInputs> = new EventEmitter();
  @Output() onCalculate: EventEmitter<CalculationInputs> = new EventEmitter();

  ngOnInit() {

  }

  /* This makes the potentially dangerous assumption that the previous unit has
   * actually changed
   */
  changeUnits(measurementUnit: MeasurementUnits) {
    this.inputGroup.measurementUnit = measurementUnit;
    this.onUnitChange.emit(this.inputGroup);
  }

  calculate() {
    this.onCalculate.emit(this.inputGroup);
  }
}
