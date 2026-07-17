import { Component, OnInit, Input, ViewChild, ElementRef, HostListener, ChangeDetectionStrategy } from '@angular/core';
import {
  trigger,
  style,
  animate,
  transition,
} from '@angular/animations';

import { CalculatorService } from '@app/services/calculator.service';
import { GraphicsService } from '@app/services/graphics.service';

import { GraphicPosition } from '@app/models/graphic-position.model';
import { RatioMode } from '@app/models/enums/stage-ratio-mode.enums';

import { SvgStandingPersonComponent } from '@components/svg-standing-person/svg-standing-person.component';
import { MeasurementUnits } from '@app/models/enums/measurement-units.enum';

import { round } from '@app/helpers/arithmetic.helper';

export type StageTopInputField =
  | 'ceilingHeight'
  | 'lectureWidth'
  | 'presenterHeight'
  | 'audienceHeight'
  | 'inputExtenderLength'
  | 'audienceDepth';

@Component({
    selector: 'app-graphical-stage-top',
    templateUrl: './graphical-stage-top.component.html',
    styleUrls: ['./graphical-stage-top.component.scss'],
    animations: [
        trigger('animateOutputArea', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('.1s', style({ opacity: 1 }))
            ]),
            transition(':leave', [
                style({ opacity: 1 }),
                animate('.1s', style({ opacity: 0 }))
            ])
        ])
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class GraphicalStageTopComponent implements OnInit {

  private STAGE_PAGE_HEIGHT_RATIO = 0.33;
  public isPrinting = false;
  public CalculatorMins = this.calculatorService.MINIMUMS;
  public CalculatorMaxes = this.calculatorService.MAXIMUMS;

  public ratioMode: RatioMode = RatioMode.Width;
  public RatioModeEnum = RatioMode;

  private pageHeight: number = 500;
  private pageWidth: number = 500;

  private wrapperWidth: number = 500;
  private wrapperHeight: number = 500;

  private containerWidth: number = 500;
  private containerHeight: number = 500;

  public stageHeight: number = 500;
  public stageWidth: number = 500;


  public widthHeightRatio: number = 1;
  public presenterCaptureRadiusPx: number = 0;
  public secondaryPresenterCaptureRadiusPx: number = 0;
  public audienceCaptureRadiusPx: number = 0;

  public audienceMicrophones: GraphicPosition[] = [];
  public presenterMicrophones: GraphicPosition[] = [];
  public presenters: GraphicPosition[] = [];

  public audienceDepthPx: number = 0;
  public depthOffset: number = 0;
  public presenterWidth: number = 0;
  public presenterOffset: number = 0;
  public audienceWidth: number = 0;
  public audienceHeight: number = 0;
  public interRowInterval: number = 0;
  public intraRowInterval: number = 0;
  public audienceDistance: number = 0;
  public audiencePerRow: number[] = [];
  public audienceRows: number[] = [];

  public presenterMicrophoneIntervalPx: number = 0;
  public microphoneDepthIntervalPx: number = 0;
  public measuringStickDepthPosition: GraphicPosition | null = null;
  public measuringStickDepthTwinned: boolean = false;
  public microphoneWidthIntervalPx: number = 0;
  public measuringStickWidthPosition: GraphicPosition | null = null;
  public measuringStickWidthTwinned: boolean = false;

  @ViewChild('wrapper',   { static: true }) wrapperRef!:   ElementRef;
  @ViewChild('container', { static: true }) containerRef!: ElementRef;
  @ViewChild('stage',     { static: true }) stageRef!:     ElementRef;

  constructor(
    public calculatorService: CalculatorService, 
    public graphicsService: GraphicsService) { }

  microphoneTrackByFn(index: number, micPosition: GraphicPosition) {
    return micPosition.number;
  }

  audienceMicrophoneTrackByFn(index: number, audienceMicPosition: GraphicPosition) {
    return audienceMicPosition.number;
  }

  measuringStickTrackByFn(index: number, measuringStickPosition: GraphicPosition) {
    return index;
  }

  personTrackByFn(index: number, personPosition: GraphicPosition) {
    return personPosition.number;
  }

  audienceRowTrackByFn(index: number, audiencePosition: number) {
    return index;
  }

  audienceTrackByFn(index: number, audiencePosition: number) {
    return index;
  }

  ngOnInit() {

    this.calculatorService.$recalculate.subscribe(recalc => {
      if (recalc) {
        this.CalculatorMins = this.calculatorService.MINIMUMS;
        this.CalculatorMaxes = this.calculatorService.MAXIMUMS;
        this.calculateProportions();
      }
    });

    this.calculatorService.$refreshBeforePrint.subscribe(refresh => {
      if (refresh) {
        this.onBeforePrint(null);
      }
    });

    this.calculatorService.$refreshAfterPrint.subscribe(refresh => {
      if (refresh) {
        this.onAfterPrint(null);
      }
    })

    this.snapshotPageDimensions();
    this.snapshotContainerDimensions();
    this.stageWidth = this.stageRef ? this.stageRef.nativeElement.offsetWidth : this.stageWidth;
    this.calculateProportions();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.snapshotPageDimensions();
    this.snapshotContainerDimensions();
    this.calculateProportions();
  }

  @HostListener('window:beforeprint',['$event'])
  onBeforePrint(event: Event | null) {
    this.isPrinting = true;
    this.STAGE_PAGE_HEIGHT_RATIO = .18;
    this.snapshotPageDimensions();
    this.snapshotContainerDimensions();
    this.calculateProportions();
  }

  @HostListener('window:afterprint',['$event'])
  onAfterPrint(event: Event | null) {
    this.isPrinting = false;
    this.STAGE_PAGE_HEIGHT_RATIO = .33;
    this.snapshotPageDimensions();
    this.snapshotContainerDimensions();
    this.calculateProportions();
  }

  private snapshotPageDimensions() {
    this.pageWidth = window.innerWidth;
    this.pageHeight = window.innerHeight;
  }

  private snapshotContainerDimensions() {
    if (this.isPrinting) {
      this.containerWidth = 450; // Good compromise between A4 and US Letter and default DPI
    } else {
      this.containerWidth = this.containerRef ? this.containerRef.nativeElement.offsetWidth : this.containerWidth;
    }
    this.wrapperWidth = this.wrapperRef ? this.wrapperRef.nativeElement.offsetWidth : this.wrapperWidth;
    this.wrapperHeight = this.wrapperRef ? this.wrapperRef.nativeElement.offsetHeight : this.wrapperHeight;
    this.containerHeight = this.containerRef ? this.containerRef.nativeElement.offsetHeight : this.containerHeight;
  }

  private calculateProportions() {
    [this.stageHeight, this.stageWidth, this.ratioMode, this.depthOffset, this.audienceDepthPx] = this.calculateStageRatios();


    this.presenterOffset = this.presenterWidth = this.getPresenterWidth();
    this.audienceWidth = this.getAudienceWidth();
    this.audienceHeight = this.audienceWidth / SvgStandingPersonComponent.SITTING_TOP_WIDTH_HEIGHT_RATIO;
    this.presenterCaptureRadiusPx = this.getPresenterCaptureRadius();
    this.audienceCaptureRadiusPx = this.getAudienceCaptureRadius();
    this.audienceDistance = this.getAudienceDistance();
    
    const { interRowInterval, intraRowInterval, audiencePerRow, audienceRows } = this.getAudiencePositions();
    this.interRowInterval = interRowInterval;
    this.intraRowInterval = intraRowInterval;
    this.audiencePerRow = audiencePerRow;
    this.audienceRows = audienceRows;

    this.audienceMicrophones = this.getAudienceMicrophonePositions(
      this.calculatorService.requiredAudienceMicrophonesWidth, this.calculatorService.requiredAudienceMicrophonesDepth, 
      this.calculatorService.audienceMicrophoneIntervalWidth, this.calculatorService.audienceMicrophoneIntervalDepth);
    [this.presenters, this.presenterMicrophones] = this.getPresenterPositions(this.calculatorService.requiredMicrophones, this.calculatorService.microphoneInterval);
  }

  private calculateStageRatios() {
    const cService = this.calculatorService;
    const presenterBodyWidth = cService.presenterWidth; // Confusing. The presenter's width is the height of the SVG.
    const presenterBodyDepth = presenterBodyWidth * SvgStandingPersonComponent.TOP_WIDTH_HEIGHT_RATIO;
    const effectiveHeight = cService.lectureWidth;
    const effectiveWidth = cService.audienceDepth + this.calculatorService.audienceDistance;

    const depthOffsetToWidthRatio = (presenterBodyDepth * 5) / effectiveWidth;
    const depthToWidthRatio = cService.audienceDepth / effectiveWidth;
    const heightWidthRatio = effectiveHeight / effectiveWidth;

    let stageHeight = 0;
    let stageWidth = 0;

    let depthOffset = 0;
    let audienceDepthPx = 0;
    let ratioMode: RatioMode;

    if (heightWidthRatio >= 1) {
      ratioMode = RatioMode.Height;
      stageHeight = this.STAGE_PAGE_HEIGHT_RATIO * this.pageHeight;
      stageWidth = Math.min(0.9 * this.containerWidth, stageHeight * (1 / heightWidthRatio));
    } else {
      ratioMode = RatioMode.Width;
      stageWidth = 0.8 * this.containerWidth;
      stageHeight = stageWidth * heightWidthRatio;
      if (stageHeight / this.pageHeight > this.STAGE_PAGE_HEIGHT_RATIO) {
        stageHeight = this.STAGE_PAGE_HEIGHT_RATIO * this.pageHeight;
        stageWidth = stageHeight * (1 / heightWidthRatio);
      }
    }
    
    audienceDepthPx = depthToWidthRatio * stageWidth;
    depthOffset = depthOffsetToWidthRatio * stageWidth;

    return [stageHeight, stageWidth, ratioMode, depthOffset, audienceDepthPx];
  }
  
  private getPresenterWidth(): number {
    const presenterBodyWidth = this.calculatorService.presenterWidth * SvgStandingPersonComponent.TOP_WIDTH_HEIGHT_RATIO;
    const presenterWidthRatio = presenterBodyWidth / this.calculatorService.lectureWidth;
    return presenterWidthRatio * this.stageHeight;
  }

  private getAudienceWidth(): number {
    const audienceBodyWidth = (0.9 * this.calculatorService.presenterWidth) * SvgStandingPersonComponent.SITTING_TOP_WIDTH_HEIGHT_RATIO;
    const widthRatio = audienceBodyWidth / this.calculatorService.audienceDepth;
    return widthRatio * this.audienceDepthPx;
  }

  private getPresenterCaptureRadius(): number {
    let radius = this.calculatorService.captureRadius;
    if (!this.calculatorService.reinforcePresenter && !this.calculatorService.recordPresenter) {
      radius = 1 * this.calculatorService.unitConversion;
    }
    const captureRadiusHeightRatio = radius / this.calculatorService.lectureWidth;
    this.secondaryPresenterCaptureRadiusPx = (this.calculatorService.secondaryCaptureRadius / this.calculatorService.lectureWidth) * this.stageHeight;
    return captureRadiusHeightRatio * this.stageHeight;
  }

  private getAudienceCaptureRadius(): number {
    const radius = this.calculatorService.topAudienceIntersectionRadius;
    //const radius = this.calculatorService.audienceMicrophoneInterval / 2;
    const radiusStageHeightRatio = radius / this.calculatorService.lectureWidth;
    return radiusStageHeightRatio * this.stageHeight;
  }

  // if (!this.calculatorService.hasFreshOutput) {
  //   return this.stageHeight * (1 * this.calculatorService.unitConversion) / this.calculatorService.ceilingHeight;
  // }
  // return (this.calculatorService.audienceDistance / this.calculatorService.ceilingHeight * this.stageHeight);


  private getAudienceDistance(): number {
    if (this.calculatorService.hasFreshOutput) {
      const distanceRatio = this.calculatorService.audienceDistance / this.calculatorService.lectureWidth;
      return this.stageHeight * distanceRatio;
    }

    const distanceRatio = (1 * this.calculatorService.unitConversion) / this.calculatorService.lectureWidth;
    return this.stageHeight * distanceRatio;
  }

  private getAudiencePositions(): any {
    const interRowInterval = this.audienceWidth * 2; // side to side

    const numRows = round((.8 * this.stageHeight)  / (this.audienceWidth + interRowInterval), 0);
    const interval = (1 * this.calculatorService.audienceWidth / this.calculatorService.audienceDepth) * this.audienceDepthPx; //(this.calculatorService.audienceDepth + this.calculatorService.audienceDistance) * this.stageWidth;

    return {
      interRowInterval: interRowInterval,
      intraRowInterval: interval,
      audiencePerRow: Array(this.calculatorService.audiencePerRow).fill(0).map((x, i) => i),
      audienceRows: Array(numRows).fill(0).map((x, i) => i)
    };
  }

  public updateInput(inputField: StageTopInputField, inputElement: HTMLInputElement): void {
    let numerical = parseFloat(inputElement.value);
    const cService = this.calculatorService;
    if (inputField in { 'ceilingHeight': null, 'lectureWidth': null, 'presenterHeight': null, 'audienceHeight': null, 'inputExtenderLength': null, 'audienceDepth': null }) {
      cService[inputField] = numerical;
      inputElement.value = String(cService[inputField]);
    }

    if (inputField === 'inputExtenderLength') {
      cService.calculateOutputs();
    }
  }

  private getPresenterPositions(numPresenterMicrophones: number, presenterMicrophoneInterval: number) {
    let presenters: GraphicPosition[] = [];
    let microphones: GraphicPosition[] = [];

    const numPresenters = numPresenterMicrophones + 1;
    const presMidpoint = Math.ceil(numPresenters / 2);
    const micMidpoint = Math.ceil(numPresenterMicrophones / 2);
    const intervalRatio = presenterMicrophoneInterval / this.calculatorService.lectureWidth;
    const intervalPercentage = intervalRatio * 100;
    const captureRadiusPercentage = (this.presenterCaptureRadiusPx / this.stageHeight) * 100;
    const presenterHeightPercentage = (this.presenterWidth / SvgStandingPersonComponent.TOP_WIDTH_HEIGHT_RATIO) / this.stageHeight * 100;
    this.presenterMicrophoneIntervalPx = intervalRatio * this.stageHeight;

    if (!this.calculatorService.hasFreshOutput || (!this.calculatorService.recordPresenter && !this.calculatorService.reinforcePresenter)) {
      presenters.push(
        new GraphicPosition(0, 0, 0 + presenterHeightPercentage / 2),
        new GraphicPosition(1, 0, 50 - (presenterHeightPercentage / 2)),
        new GraphicPosition(2, 0, 100 - (3 * presenterHeightPercentage / 2))
      );
      return [presenters, []];
    }

    if (numPresenterMicrophones % 2 === 0) {
      // Microphones
      for (let i = micMidpoint, j = 0; i < numPresenterMicrophones; i++, j++) {
        microphones.push(new GraphicPosition(i, 0, 50 - (intervalPercentage / 2) - (j * intervalPercentage) - captureRadiusPercentage));
      }
      for (let i = micMidpoint, j = 0; i > 0; i--, j++) {
        microphones.push(new GraphicPosition(i, 0, 50 + (intervalPercentage / 2) + (j * intervalPercentage) - captureRadiusPercentage));
      }

      // Presenters
      for (let i = presMidpoint, j = 1; i < numPresenters; i++, j++) {
        const boundaryOffset = i === numPresenters - 1 ? 0 : presenterHeightPercentage / 2;
        presenters.push(new GraphicPosition(i, 0, 50 - (j * intervalPercentage) - boundaryOffset));
      }
      for (let i = presMidpoint, j = 0; i > 0; i--, j++) {
        const boundaryOffset = i === 1 ? presenterHeightPercentage : presenterHeightPercentage / 2;
        presenters.push(new GraphicPosition(i, 0, 50 + (j * intervalPercentage) - boundaryOffset));
      }

    } else {
      // Microphones
      for (let i = micMidpoint, j = 1; i < numPresenterMicrophones; i++, j++) {
        microphones.push(new GraphicPosition(i, 0, 50 - (j * intervalPercentage) - captureRadiusPercentage));
      }
      for (let i = micMidpoint, j = 0; i > 0; i--, j++) {
        microphones.push(new GraphicPosition(i, 0, 50 + (j * intervalPercentage) - captureRadiusPercentage));
      }

      // Presenters
      for (let i = presMidpoint, j = 0; i < numPresenters; i++, j++) {
        const boundaryOffset = i === numPresenters - 1 ? 0 : presenterHeightPercentage / 2;
        presenters.push(new GraphicPosition(i, 0, 50 - (intervalPercentage / 2) - (j * intervalPercentage) - boundaryOffset));
      }
      for (let i = presMidpoint, j = 0; i > 0; i--, j++) {
        const boundaryOffset = i === 1 ? presenterHeightPercentage : presenterHeightPercentage / 2;
        presenters.push(new GraphicPosition(i, 0, 50 + (intervalPercentage / 2) + (j * intervalPercentage) - boundaryOffset));
      }
    }

    return [presenters, microphones];
  }

  private getAudienceMicrophonePositions(numMicrophonesWidth: number, numMicrophonesDepth: number, microphoneIntervalWidth: number, microphoneIntervalDepth: number): GraphicPosition[] {
    if (!this.calculatorService.recordAudience) {
      return [];
    }

    let microphones: GraphicPosition[] = [];
    this.measuringStickDepthPosition = null;
    this.measuringStickWidthPosition = null;
    const percentageIntervalDepth = (microphoneIntervalDepth / this.calculatorService.audienceDepth) * 100;
    const percentageIntervalWidth = (microphoneIntervalWidth / this.calculatorService.lectureWidth) * 100;

    this.microphoneDepthIntervalPx = percentageIntervalDepth * this.audienceDepthPx / 100;
    this.microphoneWidthIntervalPx = percentageIntervalWidth * this.stageHeight / 100;

    const numDepthEven = numMicrophonesDepth % 2 === 0;
    const numWidthEven = numMicrophonesWidth % 2 === 0;
    const depthMidpoint = Math.ceil(numMicrophonesDepth / 2);
    const widthMidpoint = Math.ceil(numMicrophonesWidth / 2);

    /* Because we are `ceil`ing the midpoint, we should 'favor' the right and top quadrant. */

    const parameterObject = {
      numMicrophonesWidth,
      numMicrophonesDepth,
      percentageIntervalWidth,
      percentageIntervalDepth,
      widthMidpoint,
      depthMidpoint
    };

    if (!numWidthEven && !numDepthEven) { // Both odd, one true geometric center. Simplest combination
      return this._audMicWidthOddDepthOdd(parameterObject);
    } else if (!numWidthEven&& numDepthEven) {
      return this._audMicWidthOddDepthEven(parameterObject);
    } else if (numWidthEven && !numDepthEven) {
      return this._audMicWidthEvenDepthOdd(parameterObject);
    } else if (numWidthEven && numDepthEven) {
      return this._audMicWidthEvenDepthEven(parameterObject);
    }

    return microphones;
  }

  private _audMicWidthOddDepthOdd(parameterObject: any): GraphicPosition[] {
    let microphones: GraphicPosition[] = [];
    const { numMicrophonesWidth, numMicrophonesDepth, 
      percentageIntervalWidth, percentageIntervalDepth, 
      widthMidpoint, depthMidpoint 
    } = parameterObject;

    const offsetToCenter = (3 * this.presenterOffset) + this.audienceDistance;
    if (numMicrophonesDepth > 1) {
      this.measuringStickDepthPosition = new GraphicPosition(0, offsetToCenter + (this.audienceDepthPx / 2) - this.microphoneDepthIntervalPx);
      this.measuringStickDepthTwinned = true;
    }

    if (numMicrophonesWidth > 1) {
      this.measuringStickWidthPosition = new GraphicPosition(0, offsetToCenter + this.audienceDepthPx + 10, 50 - percentageIntervalWidth);
      this.measuringStickWidthTwinned = true;
    }

    /* Start with `depthMidpoint` and go right, going up and down `width` for each `depth` mic. */
    for (let depthMic = depthMidpoint, i = 0; depthMic <= numMicrophonesDepth; depthMic++, i++) {
      const dMid = 50 + (i * percentageIntervalDepth);
      const dMidMic = new GraphicPosition(depthMic, dMid, 50);
      microphones.push(dMidMic);
      for (let widthMic = widthMidpoint - 1, j = 1; widthMic > 0; widthMic--, j++) {
        let widthMicPos = new GraphicPosition(depthMic + widthMic, dMid, 50 - (j * percentageIntervalWidth));
        microphones.push(widthMicPos);
      }
      for (let widthMic = widthMidpoint + 1, j = 1; widthMic <= numMicrophonesWidth; widthMic++, j++) {
        let widthMicPos = new GraphicPosition(depthMic + widthMic, dMid, 50 + (j * percentageIntervalWidth));
        microphones.push(widthMicPos);
      }
    }

    /* Start with `depthMidpoint - ` and go left, going up and down `width` for each `depth` mic. */
    for (let depthMic = depthMidpoint - 1, i = 1; depthMic > 0; depthMic--, i++) {
      const dMid = 50 - (i * percentageIntervalDepth);
      const dMidMic = new GraphicPosition(depthMic, dMid, 50);
      microphones.push(dMidMic);
      for (let widthMic = widthMidpoint - 1, j = 1; widthMic > 0; widthMic--, j++) {
        let widthMicPos = new GraphicPosition(depthMic + widthMic, dMid, 50 - (j * percentageIntervalWidth));
        microphones.push(widthMicPos);
      }
      for (let widthMic = widthMidpoint + 1, j = 1; widthMic <= numMicrophonesWidth; widthMic++, j++) {
        let widthMicPos = new GraphicPosition(depthMic + widthMic, dMid, 50 + (j * percentageIntervalWidth));
        microphones.push(widthMicPos);
      }
    }

    return microphones;
  }

  private _audMicWidthOddDepthEven(parameterObject: any): GraphicPosition[] {
    let microphones: GraphicPosition[] = [];
    const { numMicrophonesWidth, numMicrophonesDepth, 
      percentageIntervalWidth, percentageIntervalDepth, 
      widthMidpoint, depthMidpoint 
    } = parameterObject;

    const centerRightInterval = 50 + (percentageIntervalDepth / 2);
    const centerLeftInterval = 50 - (percentageIntervalDepth / 2);

    const offsetToCenter = (3 * this.presenterOffset) + this.audienceDistance;
    if (numMicrophonesDepth > 1) {
      this.measuringStickDepthPosition = new GraphicPosition(0, offsetToCenter + (this.audienceDepthPx - this.microphoneDepthIntervalPx) / 2, 0);
      this.measuringStickDepthTwinned = false;
    }

    if (numMicrophonesWidth > 1) {
      this.measuringStickWidthPosition = new GraphicPosition(0, offsetToCenter + this.audienceDepthPx + 10, 50 - percentageIntervalWidth);  
      this.measuringStickWidthTwinned = true;
    }

    // Right side
    for (let depthMic = depthMidpoint, i = 0; depthMic < numMicrophonesDepth; depthMic++, i++) {
      let dMid = centerRightInterval + (i * percentageIntervalDepth);
      const dMidMic = new GraphicPosition(depthMic, dMid, 50);
      microphones.push(dMidMic);
      for (let widthMic = widthMidpoint - 1, j = 1; widthMic > 0; widthMic--, j++) {
        let widthMicPos = new GraphicPosition(depthMic + widthMic, dMid, 50 - (j * percentageIntervalWidth));
        microphones.push(widthMicPos);
      }
      for (let widthMic = widthMidpoint + 1, j = 1; widthMic <= numMicrophonesWidth; widthMic++, j++) {
        let widthMicPos = new GraphicPosition(depthMic + widthMic, dMid, 50 + (j * percentageIntervalWidth));
        microphones.push(widthMicPos);
      }
    }

    // Left side 
    for (let depthMic = depthMidpoint, i = 0; depthMic > 0; depthMic--, i++) {
      let dMid = centerLeftInterval - (i * percentageIntervalDepth);
      const dMidMic = new GraphicPosition(depthMic, dMid, 50);
      microphones.push(dMidMic);
      for (let widthMic = widthMidpoint - 1, j = 1; widthMic > 0; widthMic--, j++) {
        let widthMicPos = new GraphicPosition(depthMic + widthMic, dMid, 50 - (j * percentageIntervalWidth));
        microphones.push(widthMicPos);
      }
      for (let widthMic = widthMidpoint + 1, j = 1; widthMic <= numMicrophonesWidth; widthMic++, j++) {
        let widthMicPos = new GraphicPosition(depthMic + widthMic, dMid, 50 + (j * percentageIntervalWidth));
        microphones.push(widthMicPos);
      }
    }

    return microphones;
  }

  private _audMicWidthEvenDepthOdd(parameterObject: any): GraphicPosition[] {
    let microphones: GraphicPosition[] = [];
    const { numMicrophonesWidth, numMicrophonesDepth, 
      percentageIntervalWidth, percentageIntervalDepth, 
      widthMidpoint, depthMidpoint 
    } = parameterObject;

    const centerTopInterval = 50 - (percentageIntervalWidth / 2);
    const centerBottomInterval = 50 + (percentageIntervalWidth / 2);

    const offsetToCenter = (3 * this.presenterOffset) + this.audienceDistance;
    if (numMicrophonesDepth > 1) {
      this.measuringStickDepthPosition = new GraphicPosition(0, offsetToCenter + (this.audienceDepthPx / 2) - this.microphoneDepthIntervalPx);
      this.measuringStickDepthTwinned = true;
    }

    if (numMicrophonesWidth > 1) {
      this.measuringStickWidthPosition = new GraphicPosition(0, offsetToCenter + this.audienceDepthPx + 10, 50 - (percentageIntervalWidth / 2));
      this.measuringStickWidthTwinned = false;
    }
    
    // Top side
    for (let widthMic = widthMidpoint, i = 0; widthMic < numMicrophonesWidth; widthMic++, i++) {
      const wMid = centerTopInterval - (i * percentageIntervalWidth);
      const wMidMic = new GraphicPosition(widthMic, 50, wMid);
      microphones.push(wMidMic);
      for (let depthMic = depthMidpoint - 1, j = 1; depthMic > 0; depthMic--, j++) { // iterate left
        let depthMicPos = new GraphicPosition(depthMic + widthMic, 50 - (j * percentageIntervalDepth), wMid)
        microphones.push(depthMicPos);
      }
      for (let depthMic = depthMidpoint + 1, j = 1; depthMic <= numMicrophonesDepth; depthMic++, j++) { // iterate right
        let depthMicPos = new GraphicPosition(depthMic + widthMic, 50 + (j * percentageIntervalDepth), wMid)
        microphones.push(depthMicPos);
      }
    }

    // Bottom side
    for (let widthMic = widthMidpoint, i = 0; widthMic > 0; widthMic--, i++) {
      const wMid = centerBottomInterval + (i * percentageIntervalWidth);
      const wMidMic = new GraphicPosition(widthMic, 50, wMid);
      microphones.push(wMidMic);
      for (let depthMic = depthMidpoint - 1, j = 1; depthMic > 0; depthMic--, j++) { // iterate left
        let depthMicPos = new GraphicPosition(depthMic + widthMic, 50 - (j * percentageIntervalDepth), wMid)
        microphones.push(depthMicPos);
      }
      for (let depthMic = depthMidpoint + 1, j = 1; depthMic <= numMicrophonesDepth; depthMic++, j++) { // iterate right
        let depthMicPos = new GraphicPosition(depthMic + widthMic, 50 + (j * percentageIntervalDepth), wMid)
        microphones.push(depthMicPos);
      }
    }

    return microphones;
  }

  /* Instead of just one "special" off-axis, there are now two. So 4 special origin nodes instead of just 2. */
  private _audMicWidthEvenDepthEven(parameterObject: any): GraphicPosition[] {
    let microphones: GraphicPosition[] = [];
    const { numMicrophonesWidth, numMicrophonesDepth, 
      percentageIntervalWidth, percentageIntervalDepth, 
      widthMidpoint, depthMidpoint 
    } = parameterObject;

    const centerRightInterval = 50 + (percentageIntervalDepth / 2);
    const centerLeftInterval = 50 - (percentageIntervalDepth / 2);
    const centerTopInterval = 50 - (percentageIntervalWidth / 2);
    const centerBottomInterval = 50 + (percentageIntervalWidth / 2);

    const offsetToCenter = (3 * this.presenterOffset) + this.audienceDistance;
    if (numMicrophonesDepth > 1) {
      this.measuringStickDepthPosition = new GraphicPosition(0, offsetToCenter + (this.audienceDepthPx - this.microphoneDepthIntervalPx) / 2, 0);
      this.measuringStickDepthTwinned = false;
    }

    if (numMicrophonesWidth > 1) {
      this.measuringStickWidthPosition = new GraphicPosition(0, offsetToCenter + this.audienceDepthPx + 10, 50 - (percentageIntervalWidth / 2));
      this.measuringStickWidthTwinned = false;
    }

    // Inner Upper-Right corner
    for (let depthMic = depthMidpoint, i = 0; depthMic < numMicrophonesDepth; depthMic++, i++) {
      const dMid = centerRightInterval + (i * percentageIntervalDepth);
      for (let widthMic = widthMidpoint, j = 0; widthMic > 0; widthMic--, j++) {
        let widthMicPos = new GraphicPosition(depthMic + widthMic, dMid, centerTopInterval - (j * percentageIntervalWidth));
        microphones.push(widthMicPos);
      }
    }
    // Inner Upper-Left corner
    for (let depthMic = depthMidpoint, i = 0; depthMic > 0; depthMic--, i++) {
      const dMid = centerLeftInterval - (i * percentageIntervalDepth);
      for (let widthMic = widthMidpoint, j = 0; widthMic > 0; widthMic--, j++) {
        let widthMicPos = new GraphicPosition(depthMic + widthMic, dMid, centerTopInterval - (j * percentageIntervalWidth));
        microphones.push(widthMicPos);
      }
    }

    // Inner Bottom-Right corner
    for (let depthMic = depthMidpoint, i = 0; depthMic < numMicrophonesDepth; depthMic++, i++) {
      const dMid = centerRightInterval + (i * percentageIntervalDepth);
      for (let widthMic = widthMidpoint, j = 0; widthMic < numMicrophonesWidth; widthMic++, j++) {
        let widthMicPos = new GraphicPosition(depthMic + widthMic, dMid, centerBottomInterval + (j * percentageIntervalWidth));
        microphones.push(widthMicPos);
      }
    }
    // Inner Bottom-Left corner
    for (let depthMic = depthMidpoint, i = 0; depthMic > 0; depthMic--, i++) {
      const dMid = centerLeftInterval - (i * percentageIntervalDepth);
      for (let widthMic = widthMidpoint, j = 0; widthMic > 0; widthMic--, j++) {
        let widthMicPos = new GraphicPosition(depthMic + widthMic, dMid, centerBottomInterval + (j * percentageIntervalWidth));
        microphones.push(widthMicPos);
      }
    }

    return microphones;
  }
}
