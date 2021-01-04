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
  public captureRadiusPx: number = 0;
  public captureTop: number = 0;

  public microphones = { leftMost: 0, rightMost: 0, positions: []};
  public audienceMicrophones: GraphicPosition[] = [];
  public persons = { leftMost: 0, rightMost: 0, positions: []};

  public audienceDepth: number = 0;
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
        this.audienceMicrophones = this.getAudienceMicrophonePositions(this.calculatorService.requiredAudienceMicrophonesWidth, this.calculatorService.requiredAudienceMicrophonesDepth, this.calculatorService.audienceMicrophoneInterval);
        this.calculatePersonPositions(this.calculatorService.requiredMicrophones, this.calculatorService.microphoneInterval);
      }
    });
    this.snapshotPageDimensions();
    this.snapshotContainerDimensions();
    this.stageWidth = this.stageRef ? this.stageRef.nativeElement.offsetWidth : this.stageWidth;
    this.calculateProportions();
    this.audienceMicrophones = this.getAudienceMicrophonePositions(this.calculatorService.requiredAudienceMicrophonesWidth, this.calculatorService.requiredAudienceMicrophonesDepth, this.calculatorService.audienceMicrophoneInterval);
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
    [this.stageHeight, this.stageWidth, this.ratioMode, this.depthOffset, this.audienceDepth] = this.calculateStageRatios();


    this.presenterWidth = this.getPresenterWidth();
    this.audienceWidth = this.getAudienceWidth();
    this.audienceHeight = this.audienceWidth / SvgStandingPersonComponent.SITTING_TOP_WIDTH_HEIGHT_RATIO;
    this.captureRadiusPx = this.getCaptureRadius();
    this.audienceDistance = this.getAudienceDistance();
    this.captureTop = this.getRadiusTopPosition(null);

    const { interRowInterval, intraRowInterval, audiencePerRow, audienceRows } = this.getAudienceArray();
    const { leftMicrophoneOffset, microphoneIntervalPx, microphonesPerRow, microphoneRows } = this.getMicrophoneArray();

    this.interRowInterval = interRowInterval;
    this.intraRowInterval = intraRowInterval;
    this.audiencePerRow = audiencePerRow;
    this.audienceRows = audienceRows;

    this.leftMicrophoneOffset = leftMicrophoneOffset;
    this.microphoneIntervalPx = microphoneIntervalPx;
    this.microphonesPerRow = microphonesPerRow;
    this.microphoneRows = microphoneRows;
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
    let audienceDepth = 0;
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

    audienceDepth = depthToWidthRatio * stageWidth;
    depthOffset = depthOffsetToWidthRatio * stageWidth;

    return [stageHeight, stageWidth, ratioMode, depthOffset, audienceDepth];
  }
  
  private getPresenterWidth(): number {
    const presenterBodyWidth = this.calculatorService.presenterWidth * SvgStandingPersonComponent.TOP_WIDTH_HEIGHT_RATIO;
    const presenterWidthRatio = presenterBodyWidth / this.calculatorService.lectureWidth;
    return presenterWidthRatio * this.stageHeight;
  }

  private getAudienceWidth(): number {
    const audienceBodyWidth = (0.9 * this.calculatorService.presenterWidth) * SvgStandingPersonComponent.SITTING_TOP_WIDTH_HEIGHT_RATIO;
    const widthRatio = audienceBodyWidth / this.calculatorService.lectureWidth;
    return widthRatio * this.stageHeight;
  }

  private getCaptureRadius(): number {
    const radius = this.calculatorService.audienceCaptureRadius;
    const radiusStageHeightRatio = radius / this.calculatorService.lectureWidth;
    return radiusStageHeightRatio * this.stageHeight;
  }

  private getRadiusTopPosition(numMicrophone): number {

    return 0;
  }

  private getAudienceDistance(): number {
    if (this.calculatorService.hasFreshOutput) {
      const distanceRatio = this.calculatorService.audienceDistance / this.calculatorService.lectureWidth;
      return this.stageHeight * distanceRatio;
    }

    const distanceRatio = (1 * this.calculatorService.unitConversion) / this.calculatorService.audienceDepth;
    return this.stageHeight * distanceRatio;
  }

  private getAudienceArray(): any {
    let audienceArray = [];
    const audienceOffset = this.audienceDistance;
    const audienceDepth = this.audienceDepth;

    const interRowInterval = this.audienceWidth * 2;
    const intraRowInterval = this.audienceWidth;

    const audiencePerRow = round(audienceDepth / (this.audienceWidth + interRowInterval), 0);
    const numRows = round((0.8 * this.stageHeight)  / (this.audienceWidth + intraRowInterval), 0);
    this.getMicrophoneArray();

    return {
      interRowInterval: interRowInterval,
      intraRowInterval: intraRowInterval,
      audiencePerRow: Array(audiencePerRow).fill(0).map((x, i) => i),
      audienceRows: Array(numRows).fill(0).map((x, i) => i)
    };
  }

  private getMicrophoneArray(): any {
    let microphoneArray = [];
    const sizeRatio = this.calculatorService.audienceMicrophoneInterval / this.calculatorService.lectureWidth;
    const intervalSize = sizeRatio * this.stageHeight;
    const microphoneLeftOffset = (this.presenterWidth * 5) + (intervalSize / 2); // The offset should be based on half the interval size instead

    return {
      leftMicrophoneOffset: microphoneLeftOffset,
      microphoneIntervalPx: intervalSize,
      microphonesPerRow: Array(this.calculatorService.requiredAudienceMicrophonesDepth),
      microphoneRows: Array(this.calculatorService.requiredAudienceMicrophonesWidth),
    }
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

  private getAudienceMicrophonePositions(numMicrophonesWidth: number, numMicrophonesDepth: number, microphoneInterval: number): GraphicPosition[] {
    let microphones: GraphicPosition[] = [];
    const intervalPx = (microphoneInterval / this.calculatorService.lectureWidth) * this.stageHeight;
    const rowOffsetPx = this.audienceDistance + this.captureRadiusPx;
    const topOffsetPx = (0.1 * this.stageHeight) + this.captureRadiusPx;

    for (let i = 0; i < numMicrophonesWidth; i++) {
      for (let j = 0; j < numMicrophonesDepth; j++) {
        const columnPosition = topOffsetPx + (i * intervalPx);
        const rowPosition = rowOffsetPx + (j * intervalPx);
        microphones.push(new GraphicPosition(i + j, rowPosition, columnPosition));
      }
    }

    // console.log(microphones);
    return microphones;
  }

  private getAudienceMicrophonePositions2(numMicrophonesWidth: number, numMicrophonesDepth: number, microphoneInterval: number): GraphicPosition[] {
    let microphones: GraphicPosition[] = [];
    const intervalPx = (microphoneInterval / this.calculatorService.lectureWidth) * this.stageHeight;
    const rowOffsetPx = this.audienceDistance + this.captureRadiusPx;
    const topOffsetPx = (0.1 * this.stageHeight) + this.captureRadiusPx;

    let depthMidpoint = 0;
    let depthMidpoints = [0, 0];
    let widthMidpoint = 0;
    let widthMidpoints = [0, 0];

    if (numMicrophonesDepth % 2 === 0) { // 2 "midpoints" about the true geometric middle
      depthMidpoint = Math.ceil(numMicrophonesDepth / 2);
      depthMidpoints = [depthMidpoint, depthMidpoint + 1];
    } 
    if (numMicrophonesWidth % 2 === 0) { // 2 "midpoints" about the true geometric middle
      widthMidpoint = Math.ceil(numMicrophonesWidth / 2);
      widthMidpoints = [widthMidpoint, widthMidpoint + 1];
    }
    return [];
  }

  private calculateMicrophonePositions(numMicrophonesWidth: number, numMicrophonesDepth: number, microphoneInterval: number) {
    let microphones: GraphicPosition[] = [];
    const percentageInterval = microphoneInterval;

    // let microphones: GraphicPosition[] = [];
    // const percentageInterval = microphoneInterval / this.calculatorService.lectureWidth * 100;
    // if (numMicrophones % 2 === 0) {
    //   const midpoint = Math.ceil(numMicrophones / 2);
    //   const midpoints = [midpoint, midpoint + 1];
    //   microphones.push(new GraphicPosition(midpoint, 50 - (percentageInterval / 2)));
    //   microphones.push(new GraphicPosition(midpoint, 50 + (percentageInterval / 2)));

    //   for (let mic = midpoint - 1, i = 1; mic > 0; mic--, i++) {
    //     let microphonePos = new GraphicPosition(mic, 50 - (percentageInterval / 2) - (i * percentageInterval));
    //     if (mic === 1) {
    //       this.microphones.leftMost = 50 - (percentageInterval / 2) - (i * percentageInterval);
    //     }
    //     microphones.push(microphonePos);
    //   }

    //   for (let mic = midpoint + 2, i = 1; mic <= numMicrophones; mic++, i++) {
    //     let microphonePos = new GraphicPosition(mic, 50 + (percentageInterval / 2) + (i * percentageInterval));
    //     if (mic === numMicrophones) {
    //       this.microphones.rightMost = 50 + (percentageInterval / 2) + (i * percentageInterval);
    //     }
    //     microphones.push(microphonePos);
    //   }

    // } else {
    //   const midpoint = Math.ceil(numMicrophones / 2);
    //   microphones.push(new GraphicPosition(midpoint, 50));
    //   for (let mic = midpoint - 1, i = 1; mic > 0; mic--, i++) {
    //     let microphonePos = new GraphicPosition(mic, 50 - (i * percentageInterval));
    //     if (mic === 1) {
    //       this.microphones.leftMost = 50 - (i * percentageInterval);
    //     }
    //     microphones.push(microphonePos);
    //   }

    //   for (let mic = midpoint + 1, i = 1; mic <= numMicrophones; mic++, i++) {
    //     let microphonePos = new GraphicPosition(mic, 50 + (i * percentageInterval));
    //     if (mic === numMicrophones) {
    //       this.microphones.rightMost = 50 + (i * percentageInterval);
    //     }
    //     microphones.push(microphonePos);
    //   }
    // }

    // this.microphones.positions = microphones;
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
}
