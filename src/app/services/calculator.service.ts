import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs'

import { CalculationInputs } from '@app/models/calculation-inputs.model';
import { CalculationOutputs } from '@app/models/calculation-outputs.model';
import { MeasurementUnits } from '@app/models/enums/measurement-units.enum';

import { round } from '@app/helpers/arithmetic.helper';

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {

  public static readonly METERS_TO_FEET: number = 3.28084;

  public readonly DEFAULTS = {
    ceilingHeight: 3,
    lectureWidth: 9.13,
    presenterHeight: 1.7,
    audienceHeight: 1.2
  };

  public readonly METER_MINIMUMS = {
    ceilingHeight: 2,
    lectureWidth: 4,
    presenterHeight: 1.5,
    audienceHeight: 1
  };

  public readonly METER_MAXIMUMS = {
    ceilingHeight: 30,
    lectureWidth: 62,
    presenterHeight: 2.5,
    audienceHeight: 2
  };

  public readonly FEET_MINIMUMS = {
    ceilingHeight: this.METER_MINIMUMS.ceilingHeight * CalculatorService.METERS_TO_FEET,
    lectureWidth: this.METER_MINIMUMS.lectureWidth * CalculatorService.METERS_TO_FEET,
    presenterHeight: this.METER_MINIMUMS.presenterHeight * CalculatorService.METERS_TO_FEET,
    audienceHeight: this.METER_MINIMUMS.audienceHeight * CalculatorService.METERS_TO_FEET
  }

  public readonly FEET_MAXIMUMS = {
    ceilingHeight: this.METER_MAXIMUMS.ceilingHeight * CalculatorService.METERS_TO_FEET,
    lectureWidth: this.METER_MAXIMUMS.lectureWidth * CalculatorService.METERS_TO_FEET,
    presenterHeight: this.METER_MAXIMUMS.presenterHeight * CalculatorService.METERS_TO_FEET,
    audienceHeight: this.METER_MAXIMUMS.audienceHeight * CalculatorService.METERS_TO_FEET
  }

  public MINIMUMS = this.METER_MINIMUMS;
  public MAXIMUMS = this.METER_MAXIMUMS;

  private m_measurementUnit: MeasurementUnits = MeasurementUnits.Meters;
  private m_ceilingHeight: number = this.DEFAULTS.ceilingHeight;
  private m_lectureWidth: number = this.DEFAULTS.lectureWidth;
  private m_presenterHeight: number = this.DEFAULTS.presenterHeight;
  private m_audienceHeight: number = this.DEFAULTS.audienceHeight;

  get measurementUnit(): MeasurementUnits { return this.m_measurementUnit; }
  get ceilingHeight(): number { return this.m_ceilingHeight; }
  get lectureWidth(): number { return this.m_lectureWidth; }
  get presenterHeight(): number { return this.m_presenterHeight; }
  get audienceHeight(): number { return this.m_audienceHeight; }

  set measurementUnit(val: MeasurementUnits) {
    if (this.m_measurementUnit === MeasurementUnits.Meters && val === MeasurementUnits.Feet) {
      this.m_ceilingHeight = round(this.m_ceilingHeight * CalculatorService.METERS_TO_FEET, 2);
      this.m_lectureWidth = round(this.m_lectureWidth * CalculatorService.METERS_TO_FEET, 2);
      this.m_presenterHeight = round(this.m_presenterHeight * CalculatorService.METERS_TO_FEET, 2);
      this.m_audienceHeight = round(this.m_audienceHeight * CalculatorService.METERS_TO_FEET, 2);
      this.MINIMUMS = this.FEET_MINIMUMS;
      this.MAXIMUMS = this.FEET_MAXIMUMS;
    } else if (this.m_measurementUnit === MeasurementUnits.Feet && val === MeasurementUnits.Meters) {
      this.m_ceilingHeight = round(this.m_ceilingHeight / CalculatorService.METERS_TO_FEET, 2);
      this.m_lectureWidth = round(this.m_lectureWidth / CalculatorService.METERS_TO_FEET, 2);
      this.m_presenterHeight = round(this.m_presenterHeight / CalculatorService.METERS_TO_FEET, 2);
      this.m_audienceHeight = round(this.m_audienceHeight / CalculatorService.METERS_TO_FEET, 2);
      this.MINIMUMS = this.METER_MINIMUMS;
      this.MAXIMUMS = this.METER_MAXIMUMS;
    }
    this.m_measurementUnit = val;
    this.$recalculate.next(true);
  }

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
