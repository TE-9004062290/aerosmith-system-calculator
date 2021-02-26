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
  public extenderLengthPx: number = 0;
  public audienceExtenderLengthPx: number = 0;

  public widthHeightRatio: number = 1;
  public presenterCaptureRadiusPx: number = 0;
  public secondaryPresenterCaptureRadiusPx = 0;
  public audienceCaptureRadiusPx: number = 0;
  
  public microphones: GraphicPosition[] = [];
  public audienceMicrophones: GraphicPosition[] = [];
  public persons = { leftMost: 0, rightMost: 0, positions: []};
  
  public audienceDepthPx: number = 0;
  public audienceIntervalPx: number = 0;
  public numAudience: number[] = [];
  public presenterWidth: number = 0;
  public presenterOffset: number = 0;
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

  audienceMicrophoneTrackByFn(index, audienceMicPosition: GraphicPosition) {
    return audienceMicPosition.number;
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
        this.audienceMicrophones = this.getAudienceMicrophonePositions(this.calculatorService.requiredAudienceMicrophonesDepth, this.calculatorService.audienceMicrophoneIntervalDepth);
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
    this.audienceMicrophones = this.getAudienceMicrophonePositions(this.calculatorService.requiredAudienceMicrophonesDepth, this.calculatorService.audienceMicrophoneIntervalDepth);
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
    this.STAGE_PAGE_HEIGHT_RATIO = .20;
    this.snapshotPageDimensions();
    this.snapshotContainerDimensions();
    this.calculateProportions();
  }

  @HostListener('window:afterprint',['$event'])
  onAfterPrint(event) {
    this.isPrinting = false;
    this.STAGE_PAGE_HEIGHT_RATIO = .33;
    this.snapshotPageDimensions();
    this.snapshotContainerDimensions();
    this.calculateProportions();
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
    [this.stageHeight, this.stageWidth, this.ratioMode, this.audienceDepthPx] = this.calculateStageRatios();

    this.presenterWidth = this.getPresenterWidth();
    this.presenterOffset = this.getPresenterOffset();
    this.audienceHeightPx = this.getAudienceHeight();
    this.audienceWidthPx = this.getAudienceWidth(this.audienceHeightPx);
    this.presenterCaptureRadiusPx = this.getCaptureRadius(this.calculatorService.captureRadius);
    this.audienceCaptureRadiusPx = this.getCaptureRadius(this.calculatorService.audienceCaptureRadius);
    this.audienceDistance = this.getAudienceDistance();
    this.extenderLengthPx = this.getPresenterExtenderLength();
    this.audienceExtenderLengthPx = this.getAudienceExtenderLength();
    const audiencePositions = this.getAudiencePositions();

    this.audienceIntervalPx = audiencePositions.audienceIntervalPx;
    this.numAudience = audiencePositions.numAudience;

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
      stageWidth = 0.8 * this.containerWidth;
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

  private getPresenterOffset(): number {
    const presenterBodyWidth = this.calculatorService.presenterWidth * SvgStandingPersonComponent.TOP_WIDTH_HEIGHT_RATIO;
    const presenterWidthRatio = presenterBodyWidth / this.calculatorService.ceilingHeight;
    return presenterWidthRatio * this.stageHeight;
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

  private getCaptureRadius(captureRadius: number) {
    const captureRadiusHeightRatio = (captureRadius || 1 * this.calculatorService.unitConversion) / this.calculatorService.ceilingHeight;
    this.secondaryPresenterCaptureRadiusPx = this.calculatorService.secondaryCaptureRadius / this.calculatorService.ceilingHeight * this.stageHeight;
    return captureRadiusHeightRatio * this.stageHeight; 
  }

  private getPresenterExtenderLength(): number {
    const cService = this.calculatorService;
    const extenderLength = cService.extenderLength;
    this.inputExtenderLength = cService.inputExtenderLength / cService.ceilingHeight * this.stageHeight;
    return extenderLength / cService.ceilingHeight * this.stageHeight;
  }

  private getAudienceExtenderLength(): number {
    const extenderLength = this.calculatorService.audienceExtenderLength;
    return extenderLength / this.calculatorService.ceilingHeight * this.stageHeight;
  }

  private getAudiencePositions(): any {
    const interval = this.calculatorService.audienceWidth / (this.calculatorService.audienceDepth + this.calculatorService.audienceDistance) * this.stageWidth;
    return {
      audienceIntervalPx: interval,
      numAudience: Array(this.calculatorService.audiencePerRow).fill(0).map((x, i) => i)
    };
  }

  private getAudienceMicrophonePositions(numMicrophonesDepth: number, microphoneIntervalDepth: number): GraphicPosition[] {
    if (!this.calculatorService.recordAudience) {
      return [];
    }

    let microphones: GraphicPosition[] = [];
    const percentageIntervalDepth = (microphoneIntervalDepth / this.calculatorService.audienceDepth) * 100;

    const numDepthEven = numMicrophonesDepth % 2 === 0;
    const depthMidpoint = Math.ceil(numMicrophonesDepth / 2);

    if (numDepthEven) {
      const centerRightInterval = 50 + (percentageIntervalDepth / 2);
      const centerLeftInterval = 50 - (percentageIntervalDepth / 2);

      // Right side
      for (let depthMic = depthMidpoint, i = 0; depthMic < numMicrophonesDepth; depthMic++, i++) {
        let dMid = centerRightInterval + (i * percentageIntervalDepth);
        const dMidMic = new GraphicPosition(depthMic, dMid, 50);
        microphones.push(dMidMic);
      }
  
      // Left side 
      for (let depthMic = depthMidpoint, i = 0; depthMic > 0; depthMic--, i++) {
        let dMid = centerLeftInterval - (i * percentageIntervalDepth);
        const dMidMic = new GraphicPosition(depthMic, dMid, 50);
        microphones.push(dMidMic);
      }
    } else {
      for (let depthMic = depthMidpoint, i = 0; depthMic <= numMicrophonesDepth; depthMic++, i++) {
        const dMid = 50 + (i * percentageIntervalDepth);
        const dMidMic = new GraphicPosition(depthMic, dMid, 50);
        microphones.push(dMidMic);
      }

      for (let depthMic = depthMidpoint - 1, i = 1; depthMic > 0; depthMic--, i++) {
        const dMid = 50 - (i * percentageIntervalDepth);
        const dMidMic = new GraphicPosition(depthMic, dMid, 50);
        microphones.push(dMidMic);
      }
    }

    return microphones;
  }
}
