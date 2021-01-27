import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs'

import { MeasurementUnits } from '@app/models/enums/measurement-units.enum';
import { SoundReinforcementPriority } from '@app/models/enums/sound-reinforcement-priority.enum';
import { MicrophoneRadii } from '@app/models/enums/microphone-radii.enum';

import { environment } from 'environments/environment';

import { round } from '@app/helpers/arithmetic.helper';

/* Private member naming conventions:
 * 'm_' prefix is reserved for measurable quantities using SI (preferrably) units or Imperial
 * 'c_' prefix is reserved for countable quantities. Positive integers, typically.
 * 'b_' prefix is reserved for booleans
 * 'e_' prefix is reserved for enums
 * 's_' prefix is reserved for strings
 * If there's some other prefix below that's not called out here, a note should be added for it
 */
@Injectable({
  providedIn: 'root'
})
export class CalculatorService {

  public static readonly METERS_TO_FEET: number = 3.28084;
  public static readonly FEET_TO_METERS: number = 0.3048;

  public readonly DEFAULTS = {
    ceilingHeight: 3,
    lectureWidth: 9.13,
    presenterHeight: 1.7,
    presenterWidth: .98,
    audienceHeight: 1.2,
    audienceDepth: 6,
  };

  public readonly METER_MINIMUMS = {
    ceilingHeight: 2,
    lectureWidth: 4,
    presenterHeight: 1.5,
    audienceHeight: 1,
    audienceDepth: 4, 
    microphoneInterval: 1
  };

  public readonly METER_MAXIMUMS = {
    ceilingHeight: 30,
    lectureWidth: 62,
    presenterHeight: 2.5,
    audienceHeight: 2,
    audienceDepth: 200,
  };

  public readonly FEET_MINIMUMS = {
    ceilingHeight: round(this.METER_MINIMUMS.ceilingHeight * CalculatorService.METERS_TO_FEET, 0),
    lectureWidth: round(this.METER_MINIMUMS.lectureWidth * CalculatorService.METERS_TO_FEET, 0),
    audienceDepth: round(this.METER_MINIMUMS.audienceDepth * CalculatorService.METERS_TO_FEET, 0),
    presenterHeight: round(this.METER_MINIMUMS.presenterHeight * CalculatorService.METERS_TO_FEET, 1),
    audienceHeight: round(this.METER_MINIMUMS.audienceHeight * CalculatorService.METERS_TO_FEET, 1),
    microphoneInterval: this.METER_MINIMUMS.microphoneInterval * CalculatorService.METERS_TO_FEET
  }
  
  public readonly FEET_MAXIMUMS = {
    ceilingHeight: round(this.METER_MAXIMUMS.ceilingHeight * CalculatorService.METERS_TO_FEET, 0),
    lectureWidth: round(this.METER_MAXIMUMS.lectureWidth * CalculatorService.METERS_TO_FEET, 0),
    audienceDepth: round(this.METER_MAXIMUMS.audienceDepth * CalculatorService.METERS_TO_FEET, 0),
    presenterHeight: round(this.METER_MAXIMUMS.presenterHeight * CalculatorService.METERS_TO_FEET, 1),
    audienceHeight: round(this.METER_MAXIMUMS.audienceHeight * CalculatorService.METERS_TO_FEET, 1),
  }

  public autoCalculateOutput: boolean = false;
  public displayPresenterReinforcement: boolean = true;
  public displayPresenterRecording: boolean = true;
  public displayAudienceRecording: boolean = true;

  public MINIMUMS = this.METER_MINIMUMS;
  public MAXIMUMS = this.METER_MAXIMUMS;

  private readonly VERTICAL_MINIMUM = 0.5; // Meters
  private readonly VERTICAL_THRESHOLD_0 = 1.41; // Meters
  private readonly VERTICAL_THRESHOLD_1 = 1.71; // Meters
  private readonly INTERVAL_THRESHOLD_0 = 2.83; // Meters
  private readonly INTERVAL_THRESHOLD_1 = 4.24; // Meters

  private b_pristine: boolean = false;
  private b_has_output: boolean = false;
  
  get isPristine() { return this.b_pristine; }
  get isDirty() { return !this.b_pristine; }
  get hasFreshOutput() { return this.b_has_output; }

  /* Inputs */
  /* Enum Inputs */
  private e_measurementUnit: MeasurementUnits = MeasurementUnits.Meters;
  private e_soundReinforcementPriority: SoundReinforcementPriority = SoundReinforcementPriority.AudioQuality;

  /* Boolean Inputs */
  private b_reinforcePresenter: boolean = true;
  private b_recordPresenter: boolean = false;
  private b_recordAudience: boolean = false;
  private b_designForActive: boolean = this.b_reinforcePresenter || this.b_recordPresenter || this.b_recordAudience;
  private b_extenderProvided: boolean = false
  private b_audienceExtenderProvided: boolean = false;

  /* Measurable Quantity Inputs */
  private m_captureRadius = MicrophoneRadii.PresenterReinforcementQuality;
  private m_secondaryCaptureRadius = MicrophoneRadii.PresenterRecording;
  private m_audienceCaptureRadius = MicrophoneRadii.AudienceRecording;
  private m_lectureWidth: number = this.DEFAULTS.lectureWidth;
  private m_ceilingHeight: number = this.DEFAULTS.ceilingHeight;
  private m_audienceDepth: number = this.DEFAULTS.audienceDepth;
  private m_presenterHeight: number = this.DEFAULTS.presenterHeight;
  private m_presenterWidth: number = this.DEFAULTS.presenterWidth;
  private m_audienceHeight: number = this.DEFAULTS.audienceHeight;
  private m_inputExtenderLength: number = 0;
  private m_inputAudienceExtenderLength: number = 0;


  /* Input Getters */
  get measurementUnit(): MeasurementUnits { return this.e_measurementUnit; }
  get soundReinforcementPriority(): SoundReinforcementPriority { return this.e_soundReinforcementPriority; }

  get reinforcePresenter(): boolean { return this.b_reinforcePresenter; }
  get recordPresenter(): boolean { return this.b_recordPresenter; }
  get recordAudience(): boolean { return this.b_recordAudience; }
  get designForActive(): boolean { return this.b_designForActive; }
  get extenderProvided(): boolean { return this.b_extenderProvided; }
  get audienceExtenderProvided(): boolean { return this.b_audienceExtenderProvided; }

  get captureRadius(): number { return this.m_captureRadius; }
  get secondaryCaptureRadius(): number { return this.m_secondaryCaptureRadius; }
  get audienceCaptureRadius(): number { return this.m_audienceCaptureRadius; }
  get lectureWidth(): number { return this.m_lectureWidth; }
  get ceilingHeight(): number { return this.m_ceilingHeight; }
  get audienceDepth(): number { return this.m_audienceDepth; }
  get presenterHeight(): number { return this.m_presenterHeight; }
  get presenterWidth(): number { return this.m_presenterWidth; }
  get audienceHeight(): number { return this.m_audienceHeight; }
  get inputExtenderLength(): number { return this.m_inputExtenderLength; }
  get inputAudienceExtenderLength(): number { return this.m_inputAudienceExtenderLength; }


  /* Outputs */
  /* Boolean Outputs */
  private b_extenderRequired: boolean = false;
  private b_audienceExtenderRequired: boolean = false;

  /* Measurable Quantity Outputs */
  private m_microphoneInterval: number = 0;
  private m_audienceDistance: number = 0;
  private m_audienceMicrophoneInterval: number = 0;
  private m_audienceMicrophoneIntervalWidth: number = 0;
  private m_audienceMicrophoneIntervalDepth: number = 0;
  private m_extenderLength: number = 0;
  private m_audienceExtenderLength: number = 0;
  private m_distanceBetweenAudienceAndMicrophone: number = this.calculateDistanceBetweenAudienceAndAudienceMicrophone(this.m_audienceHeight, this.m_ceilingHeight); // The vertical distance between top of audience head and the audience microphone
  private m_maxDistanceBetweenAudienceAndMicrophone: number = this.calculateMaxDistanceBetweenAudienceAndAudienceMicrophones(this.m_audienceHeight, this.m_ceilingHeight);
  private m_topAudienceIntersectionRadius: number = 0;

  /* Countable Quantity Outputs */
  private c_requiredMicrophones: number = 0;
  private c_requiredAudienceMicrophonesWidth: number = 0;
  private c_requiredAudienceMicrophonesDepth: number = 0;


  /* Output Getters */
  get extenderRequired(): boolean { return this.b_extenderRequired; }
  get audienceExtenderRequired(): boolean { return this.b_audienceExtenderRequired; }

  get microphoneInterval(): number { return this.m_microphoneInterval; }
  get audienceDistance(): number { 
    return Math.max(this.m_audienceDistance, this.unitConversion * 1); 
  }
  get audienceMicrophoneInterval(): number { return this.m_audienceMicrophoneInterval; }
  get audienceMicrophoneIntervalWidth(): number { return this.m_audienceMicrophoneIntervalWidth; }
  get audienceMicrophoneIntervalDepth(): number { return this.m_audienceMicrophoneIntervalDepth; }
  get extenderLength(): number { return this.m_extenderLength; }
  get audienceExtenderLength(): number { return this.m_audienceExtenderLength; }
  get topAudienceIntersectionRadius(): number { return this.m_topAudienceIntersectionRadius; }

  get requiredMicrophones(): number { return this.c_requiredMicrophones; }
  get requiredAudienceMicrophonesWidth(): number { return this.c_requiredAudienceMicrophonesWidth; }
  get requiredAudienceMicrophonesDepth(): number { return this.c_requiredAudienceMicrophonesDepth; }

  /* Input Setters */
  set measurementUnit(val: MeasurementUnits) {
    let conversionFactor = CalculatorService.METERS_TO_FEET;
    let conversionRequired = false;
    if (this.e_measurementUnit === MeasurementUnits.Meters && val === MeasurementUnits.Feet) {
      conversionRequired = true;
      conversionFactor = CalculatorService.METERS_TO_FEET;
      this.MINIMUMS = this.FEET_MINIMUMS;
      this.MAXIMUMS = this.FEET_MAXIMUMS;
    } else if (this.e_measurementUnit === MeasurementUnits.Feet && val === MeasurementUnits.Meters) {
      conversionRequired = true;
      conversionFactor = CalculatorService.FEET_TO_METERS;
      this.MINIMUMS = this.METER_MINIMUMS;
      this.MAXIMUMS = this.METER_MAXIMUMS;
    }

    if (conversionRequired) {
      this.e_measurementUnit = val;
      let convertibles = Object.keys(this).filter((classMember) => classMember.startsWith('m_'));
      convertibles.forEach((classMember) => {
        this[classMember] = round(this[classMember] * conversionFactor, 2);
      });

      this.updateAndEmit();
    }
  }

  set soundReinforcementPriority(val: SoundReinforcementPriority) {

    if (!this.reinforcePresenter) {
      return;
    }
    
    this.e_soundReinforcementPriority = val;
    if (this.e_soundReinforcementPriority === SoundReinforcementPriority.AudioQuality) {
      this.m_captureRadius = 2 * (this.measurementUnit === MeasurementUnits.Meters ? 1 : CalculatorService.METERS_TO_FEET);
    } else if (this.e_soundReinforcementPriority === SoundReinforcementPriority.DetectionRange ) {
      this.m_captureRadius = 3 * (this.measurementUnit === MeasurementUnits.Meters ? 1 : CalculatorService.METERS_TO_FEET);
    } else {
      this.m_captureRadius = 2 * (this.measurementUnit === MeasurementUnits.Meters ? 1 : CalculatorService.METERS_TO_FEET);
    }

    this.inputExtenderLength = this.m_inputExtenderLength; // Re-validation
    this.b_pristine = false;
    this.b_has_output = false;
    this.updateAndEmit();
  }

  set ceilingHeight(val: number) {
    val = parseFloat(<any>val);
    if (!isNaN(val)) {
      this.m_ceilingHeight = round(Math.min(Math.max(this.MINIMUMS.ceilingHeight, val), this.MAXIMUMS.ceilingHeight), 2);
      this.inputExtenderLength = this.m_inputExtenderLength; // Re-validation
      this.m_distanceBetweenAudienceAndMicrophone = this.calculateDistanceBetweenAudienceAndAudienceMicrophone(this.m_audienceHeight, this.m_ceilingHeight);
      this.m_maxDistanceBetweenAudienceAndMicrophone = this.calculateMaxDistanceBetweenAudienceAndAudienceMicrophones(this.m_audienceHeight, this.m_ceilingHeight);
      this.inputAudienceExtenderLength = this.m_inputAudienceExtenderLength;
      this.b_pristine = false;
      this.b_has_output = false;

      this.updateAndEmit();
    }
  }

  set lectureWidth(val: number) {
    val = parseFloat(<any>val);
    if (!isNaN(val)) {
      this.m_lectureWidth = round(Math.min(Math.max(this.MINIMUMS.lectureWidth, val), this.MAXIMUMS.lectureWidth), 2);
      this.b_pristine = false;
      this.b_has_output = false;

      this.updateAndEmit();
    }
  }

  set presenterHeight(val: number) {
    val = parseFloat(<any>val);
    if (!isNaN(val)) {
      this.m_presenterHeight = round(Math.min(Math.max(this.MINIMUMS.presenterHeight, val), this.MAXIMUMS.presenterHeight), 2);
      this.b_pristine = false;
      this.b_has_output = false;

      this.updateAndEmit();
    }
  }

  set audienceHeight(val: number) {
    val = parseFloat(<any>val);
    if (!isNaN(val)) {
      this.m_audienceHeight = round(Math.min(Math.max(this.MINIMUMS.audienceHeight, val), this.MAXIMUMS.audienceHeight), 2);
      this.m_distanceBetweenAudienceAndMicrophone = this.calculateDistanceBetweenAudienceAndAudienceMicrophone(this.m_audienceHeight, this.m_ceilingHeight);
      this.m_maxDistanceBetweenAudienceAndMicrophone = this.calculateMaxDistanceBetweenAudienceAndAudienceMicrophones(this.m_audienceHeight, this.m_ceilingHeight);
      this.b_pristine = false;
      this.b_has_output = false;

      this.updateAndEmit();
    }
  }

  set audienceDepth(val: number) {
    val = parseFloat(<any>val);
    if (!isNaN(val)) {
      this.m_audienceDepth = round(Math.min(Math.max(this.MINIMUMS.audienceDepth, val), this.MAXIMUMS.audienceDepth), 2);
      this.b_pristine = false;
      this.b_has_output = false;

      this.updateAndEmit();
    }
  }

  set reinforcePresenter(val: boolean) {
    this.b_reinforcePresenter = val;
    if (val) {
      switch (this.e_soundReinforcementPriority) {
        case SoundReinforcementPriority.AudioQuality:
          this.m_captureRadius = this.unitConversion * MicrophoneRadii.PresenterReinforcementQuality;
          break;
        case SoundReinforcementPriority.DetectionRange:
          this.m_captureRadius = this.unitConversion * MicrophoneRadii.PresenterReinforcementRange;
          break;
      }
      if (this.b_recordPresenter) {
        this.m_secondaryCaptureRadius = this.unitConversion * MicrophoneRadii.PresenterRecording;
      }
    } else {
      this.m_secondaryCaptureRadius = 0;
      if (this.b_recordPresenter) {
        this.m_captureRadius = this.unitConversion * MicrophoneRadii.PresenterRecording;
      } else {
        this.m_captureRadius = 0;
      }
    }

    this.b_pristine = false;
    this.b_has_output = false;
    this.setDesignForActive();
    this.updateAndEmit();
  }

  set recordPresenter(val: boolean) {
    this.b_recordPresenter = val;
    if (val) {
      if (this.b_reinforcePresenter) {
        this.m_secondaryCaptureRadius = this.unitConversion * MicrophoneRadii.PresenterRecording;
      } else {
        this.m_captureRadius = this.unitConversion * MicrophoneRadii.PresenterRecording;
        this.m_secondaryCaptureRadius = 0;
      }
    } else {
      this.m_secondaryCaptureRadius = 0;
      if (this.b_reinforcePresenter) {
        switch (this.e_soundReinforcementPriority) {
          case SoundReinforcementPriority.AudioQuality:
            this.m_captureRadius = this.unitConversion * MicrophoneRadii.PresenterReinforcementQuality;
            break;
          case SoundReinforcementPriority.DetectionRange:
            this.m_captureRadius = this.unitConversion * MicrophoneRadii.PresenterReinforcementRange;
            break;
        }
      } else {
        this.m_captureRadius = 0;
      }
    }

    this.b_pristine = false;
    this.b_has_output = false;
    this.setDesignForActive();
    this.updateAndEmit();
  }

  set recordAudience(val: boolean) {
    this.b_recordAudience = val;

    this.b_pristine = false;
    this.b_has_output = false;
    this.setDesignForActive();
    this.updateAndEmit();
  }

  set inputExtenderLength(val: number) {
    val = parseFloat(<any>val);
    if (!isNaN(val)) {
      const extenderMin = this.inputExtenderMinimum;
      const extenderMax = this.inputExtenderMaximum;
      this.m_inputExtenderLength = round(Math.min(Math.max(extenderMin, val), extenderMax), 2);
    } else {
      this.b_extenderProvided = false;
      this.m_inputExtenderLength = this.inputExtenderMinimum;
    }
    
    this.b_pristine = false;
    this.b_has_output = false;
    this.b_extenderProvided = val > 0;

    this.updateAndEmit();
  }

  set inputAudienceExtenderLength(val: number) {
    val = parseFloat(<any>val);
    if (!isNaN(val)) {
      const extenderMin = this.inputAudienceExtenderMinimum;
      const extenderMax = this.inputAudienceExtenderMaximum;
      this.m_inputAudienceExtenderLength = round(Math.min(Math.max(extenderMin, val), extenderMax), 2);
    } else {
      this.b_audienceExtenderProvided = false;
      this.m_inputAudienceExtenderLength = this.inputAudienceExtenderMinimum;
    }
    
    this.b_pristine = false;
    this.b_has_output = false;
    this.b_audienceExtenderProvided = true;

    this.updateAndEmit();
  }

  public $recalculate: BehaviorSubject<boolean>;
  public $refreshBeforePrint: BehaviorSubject<boolean>;
  public $resizer: BehaviorSubject<boolean>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { 
    this.$recalculate = new BehaviorSubject(true);
    this.$refreshBeforePrint = new BehaviorSubject(false);
    this.$resizer = new BehaviorSubject(false);
  }
  
  private updateRouteParams() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        measurementUnit: this.e_measurementUnit,
        reinforcePresenter: +this.b_reinforcePresenter, // converts to 0 or 1
        recordPresenter: +this.b_recordPresenter,
        recordAudience: +this.b_recordAudience,
        reinforcementPriority: this.e_soundReinforcementPriority,
        ceilingHeight: this.m_ceilingHeight,
        lectureWidth: this.m_lectureWidth,
        presenterHeight: this.m_presenterHeight,
        audienceHeight: this.m_audienceHeight,
        audienceDepth: this.m_audienceDepth,
        inputExtenderLength: this.m_inputExtenderLength,
        inputAudienceExtenderLength: this.m_inputAudienceExtenderLength,
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false
    });
  }

  public forceDirty() {
    this.b_pristine = false;
  }
  
  public get unitConversion(): number {
    return this.measurementUnit === MeasurementUnits.Meters ? 1 : CalculatorService.METERS_TO_FEET;
  }

  private get verticalThreshold(): number {
    return (this.soundReinforcementPriority === SoundReinforcementPriority.AudioQuality ? this.VERTICAL_THRESHOLD_0 : this.VERTICAL_THRESHOLD_1) * this.unitConversion;
  }

  private get verticalMinimum(): number {
    return this.VERTICAL_MINIMUM * this.unitConversion;
  }

  private get audienceVerticalMaximum(): number {
    const maxDistance = 0.75 * MicrophoneRadii.AudienceRecording;
    return maxDistance > this.m_ceilingHeight ? this.m_ceilingHeight - this.m_audienceHeight : maxDistance;
  }

  private get audienceVerticalMinimum(): number {
    const minDistance = 2.1 * this.m_audienceHeight;
    return minDistance > this.m_ceilingHeight ? this.m_ceilingHeight - this.m_audienceHeight : minDistance;
  }

  public get inputExtenderMaximum(): number {
    return Math.max(0, this.ceilingHeight - (this.presenterHeight - this.topOfHeadToMouth) - this.verticalMinimum - (0.1 * this.unitConversion));
  }

  public get inputAudienceExtenderMinimum(): number {
    return Math.max(0, this.m_ceilingHeight - (this.audienceVerticalMaximum + this.m_audienceHeight));
  }

  public get inputAudienceExtenderMaximum(): number {
    return Math.max(0, this.ceilingHeight - (this.audienceVerticalMinimum + this.audienceHeight));
  }

  public get inputExtenderMinimum(): number {
    return Math.max(0, this.ceilingHeight - (this.presenterHeight - this.topOfHeadToMouth) - this.verticalThreshold);
  }

  private get topOfHeadToMouth(): number {
    return 0.1 * this.unitConversion;
  }

  private setDesignForActive() {
    this.b_designForActive = this.b_reinforcePresenter || this.b_recordPresenter || this.b_recordAudience;
  }

  private calculateDistanceBetweenAudienceAndAudienceMicrophone(audienceHeight, ceilingHeight) {
    if (2.1 * audienceHeight > ceilingHeight) {
      return ceilingHeight - audienceHeight;
    } else {
      return 1.1 * audienceHeight;
    }
  }

  private calculateMaxDistanceBetweenAudienceAndAudienceMicrophones(audienceHeight, ceilingHeight) {
    const maxDistance = 0.75 * MicrophoneRadii.AudienceRecording;
    if (maxDistance > ceilingHeight) {
      return ceilingHeight - audienceHeight;
    } else {
      return maxDistance;
    }
  }

  private isExtenderRequired(captureRadius: number, ceilingHeight: number, presenterHeight: number, inputExtenderLength: number = 0) {
    const effectiveCeilingHeight = ceilingHeight - inputExtenderLength; 
    const effectivePersonHeight = presenterHeight - this.topOfHeadToMouth; 
    if (inputExtenderLength > 0) {
      return inputExtenderLength < this.inputExtenderMinimum;
    } else {
      return effectiveCeilingHeight - effectivePersonHeight > this.verticalThreshold;
    }
  }

  private isAudienceExtenderRequired(captureRadius: number, ceilingHeight: number, audienceHeight: number, inputAudienceExtenderLength: number = 0) {
    const effectiveCeilingHeight = ceilingHeight - inputAudienceExtenderLength;
    if (this.b_audienceExtenderProvided) {
      return inputAudienceExtenderLength < this.inputAudienceExtenderMinimum;
    } else {
      return effectiveCeilingHeight >= this.audienceVerticalMaximum + audienceHeight;
    }
  }

  private calculateExtenderLength(captureRadius: number, ceilingHeight: number, presenterHeight: number, inputExtenderLength: number = 0): number {
    const extenderRequired = this.isExtenderRequired(captureRadius, ceilingHeight, presenterHeight, inputExtenderLength);
    if (extenderRequired) {
        const effectivePresenterHeight = presenterHeight - this.topOfHeadToMouth;
        return ceilingHeight - effectivePresenterHeight - this.verticalThreshold;
    } else {
      if (inputExtenderLength >= 0) {
        return inputExtenderLength;
      }
      return 0;
    }
  }

  private calculateAudienceExtenderLength(audienceCaptureRadius: number, ceilingHeight: number, audienceHeight: number, inputAudienceExtenderLength: number = 0) {
    const audienceExtenderRequired = this.isAudienceExtenderRequired(audienceCaptureRadius, ceilingHeight, audienceHeight, inputAudienceExtenderLength);
    if (audienceExtenderRequired) {
        return ceilingHeight - (this.audienceVerticalMaximum + audienceHeight);
    } else {
      if (inputAudienceExtenderLength >= 0) {
        return inputAudienceExtenderLength;
      }
      return 0;
    }
  }

  private calculateAudienceDistance(captureRadius: number, ceilingHeight: number, audienceHeight: number, extenderLength: number = 0) {
    const effectiveCeilingHeight = ceilingHeight - extenderLength;
    const effectiveAudienceHeight = audienceHeight - this.topOfHeadToMouth;
    const heightDifference = effectiveCeilingHeight - effectiveAudienceHeight;
    const audienceDistance = Math.sqrt( (captureRadius ** 2) - (heightDifference)**2);

    if (isNaN(audienceDistance)) {
      return 1 * this.unitConversion;
    }

    return Math.max(1 * this.unitConversion, audienceDistance);
  }

  private calculateMicrophoneInterval(captureRadius: number, ceilingHeight: number, presenterHeight: number, extenderLength: number = 0) {
    const effectiveCeilingHeight = ceilingHeight - extenderLength;
    const effectivePresenterHeight = presenterHeight - this.topOfHeadToMouth;
    const heightDifference = effectiveCeilingHeight - effectivePresenterHeight;

    let halfChord = 0;
    if (heightDifference < captureRadius) {
      halfChord = Math.sqrt( (captureRadius ** 2) - (heightDifference**2) );
    } else { // height difference is too big; we need a bigger extender
      halfChord = Math.sqrt( (captureRadius ** 2) - (this.verticalThreshold**2) );
    }

    return Math.max(1 * this.unitConversion, 2 * halfChord);
  }

  private calculateNumMicrophones(presentationWidth: number, microphoneInterval: number) {
    const rawNumber = presentationWidth / microphoneInterval;
    return Math.ceil(rawNumber)
  }

  private refineMicrophoneInterval(presentationWidth: number, firstApproxNumMicrophones) {
    return presentationWidth / firstApproxNumMicrophones;
  }

  /* Calculates the interval between audience microphones. Should be the same for both room width and depth */
  private calculateAudienceMicrophoneInterval(audienceHeight: number, ceilingHeight: number, audienceExtenderLength: number = 0) {
    const effectiveCeilingHeight = ceilingHeight - audienceExtenderLength;
    let effectiveHeadToMicrophoneDistance = this.audienceVerticalMinimum;
    if (this.b_audienceExtenderProvided && !this.audienceExtenderRequired) {
      effectiveHeadToMicrophoneDistance = effectiveCeilingHeight - audienceHeight;
    }

    const captureRadius = this.m_audienceCaptureRadius;
    let halfChord = Math.sqrt( (captureRadius ** 2) - (effectiveHeadToMicrophoneDistance ** 2) );
    this.m_topAudienceIntersectionRadius = halfChord;
    halfChord = Math.sin(Math.PI / 4) * halfChord;
    return Math.max(1 * this.unitConversion, 2 * halfChord);
  }

  private calculateNumAudienceMicrophones(presentationWidth: number, audienceDepth: number, audienceMicrophoneInterval: number) {
    const widthRaw = presentationWidth / audienceMicrophoneInterval;
    const widthRounded = Math.ceil(widthRaw);
    // const mantissaThresholdWidth = Math.trunc(widthRaw) > 3 ? .45 : .1;
    // const widthRawMantissa = widthRaw % 1;
    // const widthRounded = widthRawMantissa >= .2 ? Math.ceil(widthRaw) : Math.floor(widthRaw);
    
    const depthRaw = audienceDepth / audienceMicrophoneInterval;
    const depthRounded = Math.ceil(depthRaw);
    // const mantissaThresholdDepth = Math.trunc(depthRaw) > 3 ? .45 : .1;
    // const depthRawMantissa = depthRaw % 1;
    // const depthRounded = depthRawMantissa >= .1 ? Math.ceil(depthRaw) : Math.floor(depthRaw);

    return {
      width: Math.max(widthRounded, 1),
      depth: Math.max(depthRounded, 1)
    };
  }

  private refineAudienceMicrophoneInterval(lectureWidth: number, audienceDepth: number, audienceMicrophoneInterval: number, numAudienceMicrophones: any): any {
    const widthCount = numAudienceMicrophones.width;
    const depthCount = numAudienceMicrophones.depth;

    return {
      width: Math.max(lectureWidth / widthCount, 1) * (audienceDepth > lectureWidth ? 1 : 1),
      depth: Math.max(audienceDepth / depthCount, 1) * (lectureWidth > audienceDepth ? 1 : 1)
    }
  }

  private refineNumAudienceMicrophones(presentationWidth: number, audienceDepth: number, intervalWidth: number, intervalDepth) {
    const widthRaw = presentationWidth / intervalWidth;
    const depthRaw = audienceDepth / intervalDepth;
    return {
      width: Math.max(round(widthRaw, 0), 1),
      depth: Math.max(round(depthRaw, 0), 1)
    };
  }

  private setOutputs(extenderLength: number, audienceDistance: number, 
    microphoneInterval: number, audienceMicrophoneIntervals: any, 
    numMicrophones: number, numAudienceMicrophones: any) {
    this.m_extenderLength = round(extenderLength, 2);
    this.m_audienceDistance = round(audienceDistance, 2);
    this.m_microphoneInterval = round(microphoneInterval, 2);
    this.m_audienceMicrophoneIntervalWidth = round(audienceMicrophoneIntervals.width, 2);
    this.m_audienceMicrophoneIntervalDepth = round(audienceMicrophoneIntervals.depth, 2);
    this.c_requiredMicrophones = round(numMicrophones, 2);
    this.c_requiredAudienceMicrophonesWidth = round(numAudienceMicrophones.width, 0);
    this.c_requiredAudienceMicrophonesDepth = round(numAudienceMicrophones.depth, 0);

    this.b_pristine = true;
    this.b_has_output = true;
  }

  private updateAndEmit() {

    if (this.designForActive && (!environment.production || this.autoCalculateOutput)) {
      this.calculateOutputs();
    }

    this.$recalculate.next(true);
    this.updateRouteParams();
  }

  public calculateOutputs() {
    const { captureRadius, audienceCaptureRadius, 
      ceilingHeight, presenterHeight, audienceHeight, 
      lectureWidth, audienceDepth, inputExtenderLength, inputAudienceExtenderLength } = this;
    const extenderRequired = this.isExtenderRequired(captureRadius, ceilingHeight, presenterHeight, inputExtenderLength);
    const extenderLength  = this.calculateExtenderLength(captureRadius, ceilingHeight, presenterHeight, inputExtenderLength);
    const audienceExtenderRequired = this.isAudienceExtenderRequired(audienceCaptureRadius, ceilingHeight, audienceHeight, inputAudienceExtenderLength);
    const audienceExtenderLength = this.calculateAudienceExtenderLength(audienceCaptureRadius, ceilingHeight, audienceHeight, inputAudienceExtenderLength);

    let microphoneInterval = this.calculateMicrophoneInterval(captureRadius, ceilingHeight, presenterHeight, extenderLength);
    const numMicrophones = this.calculateNumMicrophones(lectureWidth, microphoneInterval);
    microphoneInterval = this.refineMicrophoneInterval(lectureWidth, numMicrophones);


    let audienceMicrophoneInterval = this.calculateAudienceMicrophoneInterval(audienceHeight, ceilingHeight, audienceExtenderLength);
    let numAudienceMicrophones: Object = this.calculateNumAudienceMicrophones(lectureWidth, audienceDepth, audienceMicrophoneInterval);
    let refinedAudienceMicrophoneIntervals = this.refineAudienceMicrophoneInterval(lectureWidth, audienceDepth, audienceMicrophoneInterval, numAudienceMicrophones);
    //numAudienceMicrophones = this.refineNumAudienceMicrophones(lectureWidth, audienceDepth, refinedAudienceMicrophoneIntervals.width, refinedAudienceMicrophoneIntervals.depth);

    const radiusForAudienceDistance = this.b_recordPresenter ? MicrophoneRadii.PresenterRecording : this.b_reinforcePresenter ? MicrophoneRadii.PresenterReinforcementRange : 1;
    const audienceDistance = this.calculateAudienceDistance(radiusForAudienceDistance * this.unitConversion, ceilingHeight, audienceHeight, extenderLength);


    this.setOutputs(extenderLength, audienceDistance, microphoneInterval, refinedAudienceMicrophoneIntervals, numMicrophones, numAudienceMicrophones);
    this.b_extenderRequired = extenderRequired;
    this.b_audienceExtenderRequired = audienceExtenderRequired;
    this.m_audienceExtenderLength = round(audienceExtenderLength, 2);
  }

  public serializeToUrl() {
    const url: string = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    const inputs: string[] = [];

    inputs.push(`measurementUnit=${this.e_measurementUnit}`);
    inputs.push(`reinforcePresenter=${+this.b_reinforcePresenter}`);
    inputs.push(`recordPresenter=${+this.b_recordPresenter}`);
    inputs.push(`recordAudience=${+this.b_recordAudience}`);
    inputs.push(`reinforcementPriority=${this.e_soundReinforcementPriority}`);
    inputs.push(`ceilingHeight=${this.m_ceilingHeight}`);
    inputs.push(`lectureWidth=${this.m_lectureWidth}`);
    inputs.push(`presenterHeight=${this.m_presenterHeight}`);
    inputs.push(`audienceHeight=${this.m_audienceHeight}`);
    inputs.push(`audienceDepth=${this.m_audienceDepth}`);
    if (this.m_inputExtenderLength) {
      inputs.push(`inputExtenderLength=${this.m_inputExtenderLength}`);
    }
    if (this.m_inputAudienceExtenderLength) {
      inputs.push(`inputAudienceExtenderLength=${this.m_inputAudienceExtenderLength}`);
    }

    return `${url}?${inputs.join('&')}`;
  }
}