import { Component, OnInit, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
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
  ]
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
  public audienceCaptureRadiusPx: number = 0;

  public microphones = { leftMost: 0, rightMost: 0, positions: []};
  public audienceMicrophones: GraphicPosition[] = [];
  public persons = { leftMost: 0, rightMost: 0, positions: []};

  public audienceDepthPx: number = 0;
  public depthOffset: number = 0;
  public presenterWidth: number = 0;
  public audienceWidth: number = 0;
  public audienceHeight: number = 0;
  public interRowInterval: number = 0;
  public intraRowInterval: number = 0;
  public audienceDistance: number = 0;
  public audiencePerRow: number[] = [];
  public audienceRows: number[] = [];

  public leftMicrophoneOffset: number = 0;
  public microphoneIntervalPx: number = 0;
  public microphonesPerRow: number = 0;
  public microphoneRows: number = 0;
  
  @ViewChild('wrapper', null) wrapperRef: ElementRef;
  @ViewChild('container', null) containerRef: ElementRef;
  @ViewChild('stage', null) stageRef: ElementRef;

  constructor(
    public calculatorService: CalculatorService, 
    public graphicsService: GraphicsService) { }

  microphoneTrackByFn(index, micPosition: GraphicPosition) {
    return micPosition.number;
  }

  audienceMicrophoneTrackByFn(index, audienceMicPosition: GraphicPosition) {
    return audienceMicPosition.number;
  }


  personTrackByFn(index, personPosition: GraphicPosition) {
    return personPosition.number;
  }

  audienceRowTrackByFn(index, audiencePosition: number) {
    return index;
  }

  audienceTrackByFn(index, audiencePosition: number) {
    return index;
  }

  ngOnInit() {
    this.calculatorService.$recalculate.subscribe(recalc => {
      if (recalc) {
        this.CalculatorMins = this.calculatorService.MINIMUMS;
        this.CalculatorMaxes = this.calculatorService.MAXIMUMS;
        this.calculateProportions();
        this.audienceMicrophones = this.getAudienceMicrophonePositions(
          this.calculatorService.requiredAudienceMicrophonesWidth, this.calculatorService.requiredAudienceMicrophonesDepth, 
          this.calculatorService.audienceMicrophoneIntervalWidth, this.calculatorService.audienceMicrophoneIntervalDepth);
        this.calculatePersonPositions(this.calculatorService.requiredMicrophones, this.calculatorService.microphoneInterval);
      }
    });
    this.snapshotPageDimensions();
    this.snapshotContainerDimensions();
    this.stageWidth = this.stageRef ? this.stageRef.nativeElement.offsetWidth : this.stageWidth;
    this.calculateProportions();
    this.audienceMicrophones = this.getAudienceMicrophonePositions(
      this.calculatorService.requiredAudienceMicrophonesWidth, this.calculatorService.requiredAudienceMicrophonesDepth, 
      this.calculatorService.audienceMicrophoneIntervalWidth, this.calculatorService.audienceMicrophoneIntervalDepth);
    this.calculatePersonPositions(this.calculatorService.requiredMicrophones, this.calculatorService.microphoneInterval);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.snapshotPageDimensions();
    this.snapshotContainerDimensions();
    this.calculateProportions();
  }

  @HostListener('window:beforeprint',['$event'])
  onBeforePrint(event) {
    this.isPrinting = true;
    this.STAGE_PAGE_HEIGHT_RATIO = .18;
    this.snapshotPageDimensions();
    this.snapshotContainerDimensions();
    this.calculateProportions();
  }

  @HostListener('window:afterprint',['$event'])
  onAfterPrint(event) {
    this.isPrinting = false;
    this.STAGE_PAGE_HEIGHT_RATIO = .20;
    this.snapshotPageDimensions();
    this.snapshotContainerDimensions();
    this.calculateProportions();
  }

  private snapshotPageDimensions() {
    this.pageWidth = window.innerWidth;
    this.pageHeight = window.innerHeight;
  }

  private snapshotContainerDimensions() {
    this.wrapperWidth = this.wrapperRef ? this.wrapperRef.nativeElement.offsetWidth : this.wrapperWidth;
    this.wrapperHeight = this.wrapperRef ? this.wrapperRef.nativeElement.offsetHeight : this.wrapperHeight;
    this.containerWidth = this.containerRef ? this.containerRef.nativeElement.offsetWidth : this.containerWidth;
    this.containerHeight = this.containerRef ? this.containerRef.nativeElement.offsetHeight : this.containerHeight;
  }

  private calculateProportions() {
    [this.stageHeight, this.stageWidth, this.ratioMode, this.depthOffset, this.audienceDepthPx] = this.calculateStageRatios();


    this.presenterWidth = this.getPresenterWidth();
    this.audienceWidth = this.getAudienceWidth();
    this.audienceHeight = this.audienceWidth / SvgStandingPersonComponent.SITTING_TOP_WIDTH_HEIGHT_RATIO;
    this.presenterCaptureRadiusPx = this.getPresenterCaptureRadius();
    this.audienceCaptureRadiusPx = this.getAudienceCaptureRadius();
    this.audienceDistance = this.getAudienceDistance();

    const { interRowInterval, intraRowInterval, audiencePerRow, audienceRows } = this.getAudiencePositions();
    console.log(`Top: ${audiencePerRow} per row`);
    this.interRowInterval = interRowInterval;
    this.intraRowInterval = intraRowInterval;
    this.audiencePerRow = audiencePerRow;
    this.audienceRows = audienceRows;
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
      stageWidth = 0.9 * this.containerWidth;
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
    const radius = this.calculatorService.captureRadius;
    const captureRadiusHeightRatio = radius / this.calculatorService.lectureWidth;
    return captureRadiusHeightRatio * this.stageHeight;
  }

  private getAudienceCaptureRadius(): number {
    const radius = this.calculatorService.audienceCaptureRadius;
    //const radius = this.calculatorService.audienceMicrophoneInterval / 2;
    const radiusStageHeightRatio = radius / this.calculatorService.lectureWidth;
    return radiusStageHeightRatio * this.stageHeight;
  }

  private getAudienceDistance(): number {
    if (this.calculatorService.hasFreshOutput) {
      const distanceRatio = this.calculatorService.audienceDistance / this.calculatorService.lectureWidth;
      return this.stageHeight * distanceRatio;
    }

    const distanceRatio = (1 * this.calculatorService.unitConversion) / this.calculatorService.audienceDepth;
    return this.stageHeight * distanceRatio;
  }

  private getAudiencePositions(): any {
    const audienceOffset = this.audienceDistance;
    const audienceDepthPx = this.audienceDepthPx;

    const intraRowInterval = this.audienceWidth; // back to front
    const interRowInterval = this.audienceWidth * 2; // side to side

    const audiencePerRow = round(audienceDepthPx / (this.audienceWidth + intraRowInterval), 0);
    const numRows = round((.8 * this.stageHeight)  / (this.audienceWidth + interRowInterval), 0);

    return {
      interRowInterval: interRowInterval,
      intraRowInterval: intraRowInterval,
      audiencePerRow: Array(audiencePerRow).fill(0).map((x, i) => i),
      audienceRows: Array(numRows).fill(0).map((x, i) => i)
    };
  }

  public updateInput(inputField, inputElement) {
    let numerical = parseFloat(inputElement.value);
    const cService = this.calculatorService;
    if (inputField in { 'ceilingHeight': null, 'lectureWidth': null, 'presenterHeight': null, 'audienceHeight': null, 'inputExtenderLength': null, 'audienceDepth': null }) {
      cService[inputField] = numerical; // Rely on model logic implemented in setter
      inputElement.value = cService[inputField];
    }

    if (inputField === 'inputExtenderLength') {
      cService.calculateOutputs();
    }
  }

  private calculatePersonPositions(numMicrophones: number, microphoneInterval: number) {

    const numPersons = numMicrophones + 1;
    let persons: GraphicPosition[]= [];
    const percentageInterval = microphoneInterval / this.calculatorService.lectureWidth * 100;
    const midpoint = Math.ceil(numPersons / 2);

    if (numPersons % 2 === 0) {
      const midpoints = [midpoint, midpoint + 1];
      persons.push(new GraphicPosition(midpoint, 50 - (percentageInterval / 2)));
      persons.push(new GraphicPosition(midpoint, 50 + (percentageInterval / 2)));

      for (let p = midpoint - 1, i = 1; p > 0; p--, i++) {
        if (p === 1) {
          persons.push(new GraphicPosition(p, 0));
        } else {
          persons.push(new GraphicPosition(p, 50 - (percentageInterval / 2) - (i * percentageInterval)));
        }
      }

      for (let p = midpoint + 2, i = 1; p <= numPersons; p++, i++) {
        if (p === numPersons) {
          persons.push(new GraphicPosition(p, 100));
        } else {
          persons.push(new GraphicPosition(p, 50 + (percentageInterval / 2) + (i * percentageInterval)));
        }
      }
    } else {
      persons.push(new GraphicPosition(midpoint, 50));
      for (let p = midpoint - 1, i = 1; p > 0; p--, i++) {
        if (p === 1) {
          persons.push(new GraphicPosition(p, 0));
        } else {
          persons.push(new GraphicPosition(p, 50 - (i * percentageInterval)));
        }
      }
      for (let p = midpoint + 1, i = 1; p <= numPersons; p++, i++) {
        if (p === numPersons) {
          persons.push(new GraphicPosition(p, 100));
        } else {
          persons.push(new GraphicPosition(p, 50 + (i * percentageInterval)));
        }
      }
    }

    this.persons.positions = persons;
  }

  private getAudienceMicrophonePositions(numMicrophonesWidth: number, numMicrophonesDepth: number, microphoneIntervalWidth: number, microphoneIntervalDepth: number): GraphicPosition[] {
    let microphones: GraphicPosition[] = [];
    const percentageIntervalDepth = (microphoneIntervalDepth / this.calculatorService.audienceDepth) * 100;
    const percentageIntervalWidth = (microphoneIntervalWidth / this.calculatorService.lectureWidth) * 100;

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
