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
  public static readonly DEFAULTS = {
    ceilingHeight: 4.5,
    lectureWidth: 4,
    presenterHeight: 1.7,
    audienceHeight: 1.2
  };

  private m_ceilingHeight: number = CalculatorService.DEFAULTS.ceilingHeight;
  private m_lectureWidth: number = CalculatorService.DEFAULTS.lectureWidth;
  private m_presenterHeight: number = CalculatorService.DEFAULTS.presenterHeight;
  private m_audienceHeight: number = CalculatorService.DEFAULTS.audienceHeight;

  get ceilingHeight(): number { return this.m_ceilingHeight; }
  get lectureWidth(): number { return this.m_lectureWidth; }
  get presenterHeight(): number { return this.m_presenterHeight; }
  get audienceHeight(): number { return this.m_audienceHeight; }

  set ceilingHeight(val: number) {
    this.m_ceilingHeight = val;
    this.$recalculate.next(true);
  }

  set lectureWidth(val: number) {
    this.m_lectureWidth = val;
    this.$recalculate.next(true);
  }

  set presenterHeight(val: number) {
    this.m_presenterHeight = val;
    this.$recalculate.next(true);
  }

  set audienceHeight(val: number) {
    this.m_audienceHeight = val;
    this.$recalculate.next(true);
  }

  private $inputs: BehaviorSubject<CalculationInputs>;
  private $outputs: BehaviorSubject<CalculationOutputs>;

  public $recalculate: BehaviorSubject<boolean>;

  public inputs: CalculationInputs;
  public outputs: CalculationOutputs;
  constructor() { 
    this.$inputs = new BehaviorSubject(new CalculationInputs());
    this.$outputs = new BehaviorSubject(new CalculationOutputs());
    this.$recalculate = new BehaviorSubject(true);
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
