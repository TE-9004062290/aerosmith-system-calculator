import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';

import { CalculatorService } from '@app/services/calculator.service';
import { CalculationInputs } from '@app/models/calculation-inputs.model';
import { CalculationOutputs } from '@app/models/calculation-outputs.model';
import { MeasurementUnits } from '@app/models/enums/measurement-units.enum';
import { BehaviorSubject } from 'rxjs';


@Component({
  selector: 'app-calculation-inputs',
  templateUrl: './calculation-inputs.component.html',
  styleUrls: ['./calculation-inputs.component.scss']
})
export class CalculationInputsComponent implements OnInit {

  constructor(public calculatorService: CalculatorService) { }

  public MeasurementUnitsEnum = MeasurementUnits;
  public CalculatorDefaults = this.calculatorService.DEFAULTS;
  public CalculatorMins = this.calculatorService.MINIMUMS;
  public CalculatorMaxes = this.calculatorService.MAXIMUMS;

  @Input() measurementUnit: MeasurementUnits = MeasurementUnits.Meters;
  @Output() onUnitChange: EventEmitter<CalculationInputs> = new EventEmitter();
  @Output() onCalculate: EventEmitter<CalculationInputs> = new EventEmitter();

  ngOnInit() {
    this.calculatorService.$recalculate.subscribe(recalc => {
      if (recalc) {
        this.CalculatorMins = this.calculatorService.MINIMUMS;
        this.CalculatorMaxes = this.calculatorService.MAXIMUMS;
      }
    });
  }

  // /* This makes the potentially dangerous assumption that the previous unit has
  //  * actually changed
  //  */
  // changeUnits(measurementUnit: MeasurementUnits) {
  //   this.inputGroup.measurementUnit = measurementUnit;
  //   this.onUnitChange.emit(this.inputGroup);
  // }

  // calculate() {
  //   this.onCalculate.emit(this.inputGroup);
  // }

  public updateInput(inputField, inputElement) {
    let numerical = parseFloat(inputElement.value);
    const cService = this.calculatorService;
    if (inputField in { 'ceilingHeight': null, 'lectureWidth': null, 'presenterHeight': null, 'audienceHeight': null}) {
      if (!isNaN(numerical)) {
        numerical = numerical < this.CalculatorMins[inputField] ? this.CalculatorMins[inputField] 
          : numerical > this.CalculatorMaxes[inputField] ? this.CalculatorMaxes[inputField] : numerical;
      } else {
        numerical= this.CalculatorMins[inputField];
      }
      inputElement.value = numerical;
      cService[inputField] = numerical;
    }
  }
}
