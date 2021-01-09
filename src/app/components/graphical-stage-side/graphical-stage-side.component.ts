import { Component, OnInit, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CalculatorService } from '@app/services/calculator.service';
import { GraphicsService } from '@app/services/graphics.service';

import { GraphicPosition } from '@app/models/graphic-position.model';

import { SvgStandingPersonComponent } from '@components/svg-standing-person/svg-standing-person.component';
import { MeasurementUnits } from '@app/models/enums/measurement-units.enum';

import {
  trigger,
  style,
  animate,
  transition,
} from '@angular/animations';
import { round } from '@app/helpers/arithmetic.helper';

enum RatioMode {
  Height,
  Width,
  HalfSquareWidth
}

@Component({
  selector: 'app-graphical-stage-side',
  templateUrl: './graphical-stage-side.component.html',
  styleUrls: ['./graphical-stage-side.component.scss'],
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
export class GraphicalStageSideComponent implements OnInit {

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

  // ---

  public inputExtenderLength: number = 0;
  public extenderLength: number = 0;

  public widthHeightRatio: number = 1;
  public presenterCaptureRadiusPx: number = 0;
  public capturePosition: number = 0;
  public captureTop: number = 0;
  
  public microphones: GraphicPosition[] = [];
  public persons = { leftMost: 0, rightMost: 0, positions: []};
  
  public audienceDepthPx: number = 0;
  public audienceIntervalPx: number = 0;
  public numAudience: number[] = [];
  public presenterWidth: number = 0;
  public audienceWidthPx: number = 0;
  public audienceHeightPx: number = 0;
  public audienceDistance: number = 0;
  public audience: number[] = [];
  
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

  audienceTrackByFn(index, audiencePosition: GraphicPosition) {
    return index;
  }

  ngOnInit() {
    this.calculatorService.$recalculate.subscribe(recalc => {
      if (recalc) {
        this.CalculatorMins = this.calculatorService.MINIMUMS;
        this.CalculatorMaxes = this.calculatorService.MAXIMUMS;
        this.calculateProportions();
        //this.calculateMicrophonePositions(this.calculatorService.requiredMicrophones, this.calculatorService.microphoneInterval);
        //this.calculatePersonPositions(this.calculatorService.requiredMicrophones, this.calculatorService.microphoneInterval);
      }
    });
    this.snapshotPageDimensions();
    this.snapshotContainerDimensions();
    this.stageWidth = this.stageRef ? this.stageRef.nativeElement.offsetWidth : this.stageWidth;
    this.calculateProportions();
    //this.calculateMicrophonePositions(this.calculatorService.requiredMicrophones, this.calculatorService.microphoneInterval);
    //this.calculatePersonPositions(this.calculatorService.requiredMicrophones, this.calculatorService.microphoneInterval);
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
    [this.stageHeight, this.stageWidth, this.ratioMode, this.audienceDepthPx] = this.calculateStageRatios();

    this.presenterWidth = this.getPresenterWidth();
    this.audienceHeightPx = this.getAudienceHeight();
    this.audienceWidthPx = this.getAudienceWidth(this.audienceHeightPx);
    this.presenterCaptureRadiusPx = this.getPresenterCaptureRadius();
    this.audienceDistance = this.getAudienceDistance();
    this.captureTop = this.getRadiusTopPosition(null);
    const audiencePositions = this.getAudiencePositions();

    this.audienceIntervalPx = audiencePositions.audienceIntervalPx;
    this.numAudience = audiencePositions.numAudience;

    // console.log(this.audienceWidthPx, this.audienceHeightPx, this.audienceDepthPx)
  }

  private calculateStageRatios() {
    const cService = this.calculatorService;

    const effectiveHeight = cService.ceilingHeight;
    const effectiveWidth = cService.audienceDepth + this.calculatorService.audienceDistance;
    const heightWidthRatio = effectiveHeight / effectiveWidth;
    
    let stageHeight = 0;
    let stageWidth = 0;

    let ratioMode: RatioMode;

    if (heightWidthRatio >= 1) {
      ratioMode = RatioMode.Height;
      stageHeight = this.STAGE_PAGE_HEIGHT_RATIO * this.pageHeight;
      stageWidth = Math.min(.9 * this.containerWidth, stageHeight * (1 / heightWidthRatio));
    } else {
      ratioMode = RatioMode.Width;
      stageWidth = 0.9 * this.containerWidth;
      stageHeight = stageWidth * heightWidthRatio;
      if (stageHeight / this.pageHeight > this.STAGE_PAGE_HEIGHT_RATIO) {
        stageHeight = this.STAGE_PAGE_HEIGHT_RATIO * this.pageHeight;
        stageWidth = stageHeight * (1 / heightWidthRatio);
      }
    }

    const audienceDepthPx = (cService.audienceDepth / effectiveWidth) * stageWidth;

    return [stageHeight, stageWidth, ratioMode, audienceDepthPx];
  }

  private getPresenterWidth(): number {
    const presenterCeilingRatio = this.calculatorService.presenterHeight / this.calculatorService.ceilingHeight;
    return presenterCeilingRatio * this.stageHeight * SvgStandingPersonComponent.SIDE_WIDTH_HEIGHT_RATIO;
  }

  private getAudienceHeight(): number {
    const audienceCeilingRatio = this.calculatorService.audienceHeight / this.calculatorService.ceilingHeight;
    return this.stageHeight * audienceCeilingRatio;
  }

  private getAudienceWidth(audienceHeightPx: number): number {
    return audienceHeightPx * SvgStandingPersonComponent.SITTING_WIDTH_HEIGHT_RATIO;
  }

  private getAudienceDistance(): number {
    if (!this.calculatorService.hasFreshOutput) {
      return this.stageHeight * (1 * this.calculatorService.unitConversion) / this.calculatorService.ceilingHeight;
    }
    return (this.calculatorService.audienceDistance / this.calculatorService.ceilingHeight * this.stageHeight);
  }

  private getRadiusWidthPercentage(): number {
    const diameter = this.calculatorService.captureRadius * 2;
    let captureDiameterWidthRatio = diameter / this.calculatorService.lectureWidth;
    return captureDiameterWidthRatio * 100;
  }

  private getPresenterCaptureRadius(): number {
    const radius = this.calculatorService.captureRadius;
    const captureRadiusHeightRatio = radius / this.calculatorService.ceilingHeight;
    return captureRadiusHeightRatio * this.stageHeight;
  }

  private getRadiusTopPosition(numMicrophone): number {
    const cService = this.calculatorService;
    const extenderLength = cService.extenderLength;
    this.inputExtenderLength = cService.inputExtenderLength / cService.ceilingHeight * this.stageHeight;
    this.extenderLength = extenderLength / cService.ceilingHeight * this.stageHeight;

    return 0;
  }

  private getAudiencePositions(): any {
    const audienceDepthPx = this.audienceDepthPx;
    const intraRowInterval = this.audienceWidthPx;

    const audiencePerRow = round(audienceDepthPx / (this.audienceWidthPx + intraRowInterval), 0);
    console.log(`${audiencePerRow} per row`)
    return {
      audienceIntervalPx: intraRowInterval,
      numAudience: Array(audiencePerRow).fill(0).map((x, i) => i)
    };
  }

  private getAudienceArray(): any {
    let audienceArray = [];
    const leftOffset = (this.presenterCaptureRadiusPx / 1.9) + this.audienceDistance;
    // const effectiveStageWidth = (0.9 *this.sideWrapperWidth) - this.audienceDistance;
    const effectiveStageWidth = this.audienceDepthPx  - (1 * this.calculatorService.unitConversion);
    const numAudience = Math.floor(effectiveStageWidth / (2 * this.audienceWidthPx));
    for (let i = 0; i < numAudience; i++) {
      audienceArray.push(new GraphicPosition(i, leftOffset + 2 * i * this.audienceWidthPx));
    }
    return audienceArray;
  }

  public updateInput(inputField, inputElement) {
    let numerical = parseFloat(inputElement.value);
    const cService = this.calculatorService;
    if (inputField in { 'ceilingHeight': null, 'presenterHeight': null, 'audienceHeight': null, 'inputExtenderLength': null, 'audienceDepth': null }) {
      cService[inputField] = numerical; // Rely on model logic implemented in setter
      inputElement.value = cService[inputField];
    }

    if (inputField === 'inputExtenderLength') {
      cService.calculateOutputs();
    }
  }

  // private calculateMicrophonePositions(numMicrophones: number, microphoneInterval: number) {
  //   let microphones: GraphicPosition[] = [];
  //   const percentageInterval = microphoneInterval / this.calculatorService.lectureWidth * 100;
  //   if (numMicrophones % 2 === 0) {
  //     const midpoint = Math.ceil(numMicrophones / 2);
  //     const midpoints = [midpoint, midpoint + 1];
  //     microphones.push(new GraphicPosition(midpoint, 50 - (percentageInterval / 2)));
  //     microphones.push(new GraphicPosition(midpoint, 50 + (percentageInterval / 2)));

  //     for (let mic = midpoint - 1, i = 1; mic > 0; mic--, i++) {
  //       let microphonePos = new GraphicPosition(mic, 50 - (percentageInterval / 2) - (i * percentageInterval));
  //       if (mic === 1) {
  //         this.microphones.leftMost = 50 - (percentageInterval / 2) - (i * percentageInterval);
  //       }
  //       microphones.push(microphonePos);
  //     }

  //     for (let mic = midpoint + 2, i = 1; mic <= numMicrophones; mic++, i++) {
  //       let microphonePos = new GraphicPosition(mic, 50 + (percentageInterval / 2) + (i * percentageInterval));
  //       if (mic === numMicrophones) {
  //         this.microphones.rightMost = 50 + (percentageInterval / 2) + (i * percentageInterval);
  //       }
  //       microphones.push(microphonePos);
  //     }

  //   } else {
  //     const midpoint = Math.ceil(numMicrophones / 2);
  //     microphones.push(new GraphicPosition(midpoint, 50));
  //     for (let mic = midpoint - 1, i = 1; mic > 0; mic--, i++) {
  //       let microphonePos = new GraphicPosition(mic, 50 - (i * percentageInterval));
  //       if (mic === 1) {
  //         this.microphones.leftMost = 50 - (i * percentageInterval);
  //       }
  //       microphones.push(microphonePos);
  //     }

  //     for (let mic = midpoint + 1, i = 1; mic <= numMicrophones; mic++, i++) {
  //       let microphonePos = new GraphicPosition(mic, 50 + (i * percentageInterval));
  //       if (mic === numMicrophones) {
  //         this.microphones.rightMost = 50 + (i * percentageInterval);
  //       }
  //       microphones.push(microphonePos);
  //     }
  //   }

  //   this.microphones.positions = microphones;
  // }
}
