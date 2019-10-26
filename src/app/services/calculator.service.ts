import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs'

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

  /* Inputs */
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

  /* Outputs */
  private m_microphoneInterval: number = 0;
  private m_requiredMicrophones: number = 0;
  private m_extenderLength: number = 0;

  get microphoneInterval(): number { return this.m_microphoneInterval; }
  get requiredMicrophones(): number { return this.m_requiredMicrophones; }
  get extenderLength(): number { return this.m_extenderLength; }

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

  public $recalculate: BehaviorSubject<boolean>;
  constructor() { 
    this.$recalculate = new BehaviorSubject(true);
  }

  public calculateOutputs() {
    const captureRadius = 2 * (this.measurementUnit === MeasurementUnits.Meters ? 1 : CalculatorService.METERS_TO_FEET);
    const topOfHeadToMouth = 0.1 * (this.measurementUnit === MeasurementUnits.Meters ? 1 : CalculatorService.METERS_TO_FEET);
    const extenderLength = this.m_ceilingHeight - this.m_presenterHeight - captureRadius + 5*topOfHeadToMouth;

    if (this.m_ceilingHeight - this.m_presenterHeight < captureRadius) {
      this.m_extenderLength = 0;
      this.m_microphoneInterval = round(2 * Math.sqrt((captureRadius ** 2) - (this.m_ceilingHeight - this.m_presenterHeight + topOfHeadToMouth)**2), 2);
      if (this.m_microphoneInterval === 0) {
        this.m_microphoneInterval = round(2 * Math.sqrt((captureRadius ** 2) - (this.m_ceilingHeight - 0.9 - this.m_presenterHeight + topOfHeadToMouth)**2), 2);
      }
      this.m_requiredMicrophones = Math.ceil(this.m_lectureWidth / this.m_microphoneInterval);
    } else { // extender is required
      this.m_extenderLength = extenderLength;
      this.m_microphoneInterval = round(2 * Math.sqrt((captureRadius ** 2) - (captureRadius + 1 - this.m_presenterHeight + topOfHeadToMouth)**2), 2);
      this.m_requiredMicrophones = Math.ceil(this.m_lectureWidth / this.m_microphoneInterval);
    }
  }
}
