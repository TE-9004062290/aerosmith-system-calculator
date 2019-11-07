import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs'

import { MeasurementUnits } from '@app/models/enums/measurement-units.enum';
import { CalculationPriority } from '@app/models/enums/calculation-priority.enums';

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
    audienceHeight: 1,
    microphoneInterval: 1
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
    audienceHeight: this.METER_MINIMUMS.audienceHeight * CalculatorService.METERS_TO_FEET,
    microphoneInterval: this.METER_MINIMUMS.microphoneInterval * CalculatorService.METERS_TO_FEET
  }

  public readonly FEET_MAXIMUMS = {
    ceilingHeight: this.METER_MAXIMUMS.ceilingHeight * CalculatorService.METERS_TO_FEET,
    lectureWidth: this.METER_MAXIMUMS.lectureWidth * CalculatorService.METERS_TO_FEET,
    presenterHeight: this.METER_MAXIMUMS.presenterHeight * CalculatorService.METERS_TO_FEET,
    audienceHeight: this.METER_MAXIMUMS.audienceHeight * CalculatorService.METERS_TO_FEET
  }

  public MINIMUMS = this.METER_MINIMUMS;
  public MAXIMUMS = this.METER_MAXIMUMS;

  private m_pristine: boolean = false;
  private m_has_output: boolean = false;
  
  get isPristine() {
    return this.m_pristine;
  }

  get isDirty() {
    return !this.m_pristine;
  }

  get hasFreshOutput() {
    return this.m_has_output;
  }



  private m_captureRadius = 2;
  /* Inputs */
  private m_measurementUnit: MeasurementUnits = MeasurementUnits.Meters;
  private m_calculationPriority: CalculationPriority = CalculationPriority.AudioQuality;

  private m_ceilingHeight: number = this.DEFAULTS.ceilingHeight;
  private m_lectureWidth: number = this.DEFAULTS.lectureWidth;
  private m_presenterHeight: number = this.DEFAULTS.presenterHeight;
  private m_audienceHeight: number = this.DEFAULTS.audienceHeight;
  private m_inputExtenderLength: number = 0;
  private m_extenderProvided: boolean = false

  get measurementUnit(): MeasurementUnits { return this.m_measurementUnit; }
  get calculationPriority(): CalculationPriority { return this.m_calculationPriority; }

  get ceilingHeight(): number { return this.m_ceilingHeight; }
  get lectureWidth(): number { return this.m_lectureWidth; }
  get presenterHeight(): number { return this.m_presenterHeight; }
  get audienceHeight(): number { return this.m_audienceHeight; }
  get captureRadius(): number { return this.m_captureRadius; }
  get inputExtenderLength(): number { return this.m_inputExtenderLength; }
  get extenderProvided(): boolean { return this.m_extenderProvided; }

  /* Outputs */
  private m_microphoneInterval: number = 0;
  private m_requiredMicrophones: number = 0;
  private m_extenderRequired: boolean = false;
  private m_extenderLength: number = 0;
  private m_audienceDistance: number = 0;

  get microphoneInterval(): number { return this.m_microphoneInterval; }
  get requiredMicrophones(): number { return this.m_requiredMicrophones; }
  get extenderLength(): number { return this.m_extenderLength; }
  get audienceDistance(): number { return this.m_audienceDistance; }
  get extenderRequired(): boolean { return this.m_extenderRequired; }

  set measurementUnit(val: MeasurementUnits) {
    if (this.m_measurementUnit === MeasurementUnits.Meters && val === MeasurementUnits.Feet) {
      this.m_ceilingHeight = round(this.m_ceilingHeight * CalculatorService.METERS_TO_FEET, 2);
      this.m_lectureWidth = round(this.m_lectureWidth * CalculatorService.METERS_TO_FEET, 2);
      this.m_presenterHeight = round(this.m_presenterHeight * CalculatorService.METERS_TO_FEET, 2);
      this.m_audienceHeight = round(this.m_audienceHeight * CalculatorService.METERS_TO_FEET, 2);
      this.m_microphoneInterval = round(this.m_microphoneInterval * CalculatorService.METERS_TO_FEET, 2);
      this.m_extenderLength = round(this.m_extenderLength * CalculatorService.METERS_TO_FEET, 2);
      this.m_inputExtenderLength = round(this.m_inputExtenderLength * CalculatorService.METERS_TO_FEET, 2);
      this.m_audienceDistance = round(this.m_audienceDistance * CalculatorService.METERS_TO_FEET, 2);
      this.m_captureRadius = round(this.m_captureRadius * CalculatorService.METERS_TO_FEET, 2);
      this.MINIMUMS = this.FEET_MINIMUMS;
      this.MAXIMUMS = this.FEET_MAXIMUMS;
    } else if (this.m_measurementUnit === MeasurementUnits.Feet && val === MeasurementUnits.Meters) {
      this.m_ceilingHeight = round(this.m_ceilingHeight / CalculatorService.METERS_TO_FEET, 2);
      this.m_lectureWidth = round(this.m_lectureWidth / CalculatorService.METERS_TO_FEET, 2);
      this.m_presenterHeight = round(this.m_presenterHeight / CalculatorService.METERS_TO_FEET, 2);
      this.m_audienceHeight = round(this.m_audienceHeight / CalculatorService.METERS_TO_FEET, 2);
      this.m_microphoneInterval = round(this.m_microphoneInterval / CalculatorService.METERS_TO_FEET, 2);
      this.m_extenderLength = round(this.m_extenderLength / CalculatorService.METERS_TO_FEET, 2);
      this.m_inputExtenderLength = round(this.m_inputExtenderLength / CalculatorService.METERS_TO_FEET, 2);
      this.m_audienceDistance = round(this.m_audienceDistance / CalculatorService.METERS_TO_FEET, 2);
      this.m_captureRadius = round(this.m_captureRadius / CalculatorService.METERS_TO_FEET, 2);
      this.MINIMUMS = this.METER_MINIMUMS;
      this.MAXIMUMS = this.METER_MAXIMUMS;
    }
    this.m_measurementUnit = val;
    this.$recalculate.next(true);
  }

  set calculationPriority(val: CalculationPriority) {
    this.m_calculationPriority = val;
    this.m_pristine = false;
    this.m_has_output = false;
    if (this.m_calculationPriority === CalculationPriority.AudioQuality) {
      this.m_captureRadius = 2 * (this.measurementUnit === MeasurementUnits.Meters ? 1 : CalculatorService.METERS_TO_FEET);
    } else {
      this.m_captureRadius = 3 * (this.measurementUnit === MeasurementUnits.Meters ? 1 : CalculatorService.METERS_TO_FEET);
    }
    this.$recalculate.next(true);
  }

  set ceilingHeight(val: number) {
    this.m_ceilingHeight = val;
    this.m_pristine = false;
    this.m_has_output = false;
    this.$recalculate.next(true);
  }

  set lectureWidth(val: number) {
    this.m_lectureWidth = val;
    this.m_pristine = false;
    this.m_has_output = false;
    this.$recalculate.next(true);
  }

  set presenterHeight(val: number) {
    this.m_presenterHeight = val;
    this.m_pristine = false;
    this.m_has_output = false;
    this.$recalculate.next(true);
  }

  set audienceHeight(val: number) {
    this.m_audienceHeight = val;
    this.m_pristine = false;
    this.m_has_output = false;
    this.$recalculate.next(true);
  }

  set inputExtenderLength(val: number) {
    this.m_inputExtenderLength = val;
    this.m_pristine = false;
    this.m_has_output = false;
    this.m_extenderProvided = val > 0;
    this.$recalculate.next(true);
  }

  public $recalculate: BehaviorSubject<boolean>;
  constructor() { 
    this.$recalculate = new BehaviorSubject(true);
  }

  private get unitConversion(): number {
    return this.measurementUnit === MeasurementUnits.Meters ? 1 : CalculatorService.METERS_TO_FEET;
  }

  private get topOfHeadToMouth(): number {
    return 0.1 * this.unitConversion;
  }

  private isExtenderRequired(captureRadius: number, ceilingHeight: number, presenterHeight: number, inputExtenderLength: number = 0) {
    const effectiveCeilingHeight = ceilingHeight - inputExtenderLength;
    return captureRadius <= effectiveCeilingHeight - presenterHeight + this.topOfHeadToMouth;
  }

  private calculateExtenderLength(captureRadius: number, ceilingHeight: number, presenterHeight: number, inputExtenderLength: number = 0): number {
    const extenderRequired = this.isExtenderRequired(captureRadius, ceilingHeight, presenterHeight, inputExtenderLength);
    if (extenderRequired) {
        return ceilingHeight - presenterHeight - captureRadius + 15*this.topOfHeadToMouth;
    } else {
      if (inputExtenderLength > 0) {
        return inputExtenderLength;
      }
      return 0;
    }
  }

  private calculateAudienceDistance(captureRadius: number, ceilingHeight: number, audienceHeight: number, extenderLength: number = 0) {
    const effectiveCeilingHeight = ceilingHeight - audienceHeight - extenderLength;
    const audienceDistance = Math.sqrt( (captureRadius ** 2) - (effectiveCeilingHeight)**2);
    return Math.max(1 * this.unitConversion, audienceDistance);
  }

  private calculateMicrophoneInterval(captureRadius: number, ceilingHeight: number, presenterHeight: number, extenderLength: number = 0) {
    const effectiveCeilingHeight = ceilingHeight - extenderLength;
    const heightDifference = effectiveCeilingHeight - presenterHeight + this.topOfHeadToMouth;

    let halfChord = 0;
    if (heightDifference < captureRadius) {
      halfChord = Math.sqrt( (captureRadius ** 2) - (heightDifference**2) );
    } else { // height difference is too big; we need a bigger extender
      halfChord = Math.sqrt( (captureRadius ** 2) - ((captureRadius - 15*this.topOfHeadToMouth)**2) );
    }

    return Math.max(1 * this.unitConversion, 2 * halfChord);
  }

  private calculateNumMicrophones(presentationWidth: number, microphoneInterval: number) {
    const rawNumber = presentationWidth / microphoneInterval;
    const mantissa = rawNumber % 1;
    return mantissa > 0.1 ? Math.ceil(rawNumber) : Math.floor(rawNumber);
  }

  private setOutputs(extenderLength: number, audienceDistance: number, microphoneInterval: number, numMicrophones: number) {
    this.m_extenderLength = round(extenderLength, 2);
    this.m_audienceDistance = round(audienceDistance, 2);
    this.m_microphoneInterval = round(microphoneInterval, 2);
    this.m_requiredMicrophones = round(numMicrophones, 2);
    this.m_pristine = true;
    this.m_has_output = true;
  }

  public calculateOutputs() {
    const { captureRadius, ceilingHeight, presenterHeight, audienceHeight, lectureWidth, inputExtenderLength } = this;
    
    const extenderRequired = this.isExtenderRequired(captureRadius, ceilingHeight, presenterHeight, inputExtenderLength);
    const extenderLength  = this.calculateExtenderLength(captureRadius, ceilingHeight, presenterHeight, inputExtenderLength);
    const microphoneInterval = this.calculateMicrophoneInterval(captureRadius, ceilingHeight, presenterHeight, extenderLength);
    const numMicrophones = this.calculateNumMicrophones(lectureWidth, microphoneInterval);
    const audienceDistance = this.calculateAudienceDistance(captureRadius, ceilingHeight, audienceHeight, extenderLength);
    
    this.setOutputs(extenderLength, audienceDistance, microphoneInterval, numMicrophones);
    this.m_extenderRequired = extenderRequired;
  }
}
