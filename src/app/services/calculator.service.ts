import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs'

import { CalculationInputs } from '@app/models/calculation-inputs.model';
import { CalculationOutputs } from '@app/models/calculation-outputs.model';
import { MeasurementUnits } from '@app/models/enums/measurement-units.enum';

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {


  private $inputs: BehaviorSubject<CalculationInputs>;
  private $outputs: BehaviorSubject<CalculationOutputs>;

  public inputs: CalculationInputs;
  public outputs: CalculationOutputs;
  constructor() { 
    this.$inputs = new BehaviorSubject(new CalculationInputs());
    this.$outputs = new BehaviorSubject(new CalculationOutputs());
    this.inputs = new CalculationInputs();
    this.outputs = new CalculationOutputs;
  }
  
  $getInputs(): BehaviorSubject<CalculationInputs> {
    return this.$inputs;
  }

  $getOutputs(): Observable<CalculationOutputs> {
    return this.$outputs;
  }

  updateInputs(inputModel: CalculationInputs): void {
    this.$inputs.next(inputModel);
    // do output calcs
    // const newOutput = null;
    // this.$outputs.next(newOutput);
  }



}
