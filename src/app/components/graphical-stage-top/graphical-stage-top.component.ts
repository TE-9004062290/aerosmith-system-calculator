import { Component, OnInit, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import {
  trigger,
  style,
  animate,
  transition,
} from '@angular/animations';

import { CalculatorService } from '@app/services/calculator.service';
import { GraphicsService } from '@app/services/graphics.service';

import GraphicPosition from '@app/models/graphic-position.model';
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

  private STAGE_PAGE_HEIGHT_RATIO = 0.20;
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
  public sideCapture: number = 0;
  public captureWidthPercentage: number = 0;
  public capturePosition: number = 0;
  public captureTop: number = 0;

  public microphones = { leftMost: 0, rightMost: 0, positions: []};
  public persons = { leftMost: 0, rightMost: 0, positions: []};

  public audienceDepth: number = 0;
  public depthOffset: number = 0;
  public presenterWidth: number = 0;
  public audienceWidth: number = 0;
  public audienceDistance: number = 0;
  public audienceArray: number[] = [];
  
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
    return audiencePosition.number;
  }

  ngOnInit() {
    this.calculatorService.$recalculate.subscribe(recalc => {
      if (recalc) {
        this.CalculatorMins = this.calculatorService.MINIMUMS;
        this.CalculatorMaxes = this.calculatorService.MAXIMUMS;
        this.calculateProportions();
        this.calculateMicrophonePositions(this.calculatorService.requiredMicrophones, this.calculatorService.microphoneInterval);
        this.calculatePersonPositions(this.calculatorService.requiredMicrophones, this.calculatorService.microphoneInterval);
      }
    });
    this.snapshotPageDimensions();
    this.snapshotContainerDimensions();
    this.stageWidth = this.stageRef ? this.stageRef.nativeElement.offsetWidth : this.stageWidth;
    this.calculateProportions();
    this.calculateMicrophonePositions(this.calculatorService.requiredMicrophones, this.calculatorService.microphoneInterval);
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
    this.captureWidthPercentage = this.getRadiusWidthPercentage();
    this.sideCapture = this.getSideRadius();
    this.audienceDistance = this.getAudienceDistance();
    this.captureTop = this.getRadiusTopPosition(null);
    this.audienceArray = this.getAudienceArray();
  }

  private calculateStageRatios() {
    const cService = this.calculatorService;
    const presenterBodyDepth = 0.589; // Meters;
    const effectiveHeight = cService.audienceDepth + (presenterBodyDepth * 5);

    const depthOffsetToHeightRatio = (presenterBodyDepth * 5) / effectiveHeight;
    const depthToHeightRatio = cService.audienceDepth / effectiveHeight;
    const heightWidthRatio = effectiveHeight / cService.lectureWidth;

    let stageHeight = 0;
    let stageWidth = 0;

    let depthOffset = 0;
    let stageDepth = 0;
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
    stageDepth = depthToHeightRatio * stageHeight;
    depthOffset = depthOffsetToHeightRatio * stageHeight;

    return [stageHeight, stageWidth, ratioMode, depthOffset, stageDepth];
  }
  
  private getPresenterWidth(): number {
    const cService = this.calculatorService;
    const presenterBodyWidth = 0.589; // meters
    const presenterWidthRatio = presenterBodyWidth / cService.audienceDepth;
    return presenterWidthRatio * this.stageHeight * SvgStandingPersonComponent.TOP_WIDTH_HEIGHT_RATIO
  }

  private getAudienceWidth(): number {
    const audienceBodyDepth = 0.589; // meters
    const audienceDepthRatio = audienceBodyDepth / this.calculatorService.audienceDepth;
    return audienceDepthRatio * this.stageHeight * SvgStandingPersonComponent.SITTING_TOP_WIDTH_HEIGHT_RATIO;
  }

  private getRadiusWidthPercentage(): number {
    const diameter = this.calculatorService.captureRadius * 2;
    let captureDiameterWidthRatio = diameter / this.calculatorService.lectureWidth;
    return captureDiameterWidthRatio * 100;
  }

  private getSideRadius(): number {
    const radius = this.calculatorService.captureRadius;
    const captureRadiusHeightRatio = radius / this.calculatorService.audienceDepth;
    return captureRadiusHeightRatio * this.stageHeight;
  }

  private getRadiusTopPosition(numMicrophone): number {

    return 0;
  }

  private getAudienceDistance(): number {
    if (!this.calculatorService.hasFreshOutput) {
      return this.stageHeight * (1 * this.calculatorService.unitConversion) / this.calculatorService.audienceDepth;
    }
    return (this.calculatorService.audienceDistance / this.calculatorService.audienceDepth * this.stageHeight);
  }

  private getAudienceDepth(): number {
      // const x = this.stageHeight * (this.calculatorService.audienceDepth * this.calculatorService.unitConversion) / this.calculatorService.audienceDepth;
      // console.log(x);
      // return x;
      console.log(this.presenterWidth / SvgStandingPersonComponent.TOP_WIDTH_HEIGHT_RATIO );
      const depth = this.stageHeight - ((this.presenterWidth / SvgStandingPersonComponent.TOP_WIDTH_HEIGHT_RATIO) * 5);
      //console.log(`stageHeight: ${this.stageHeight} - (presenterWidth * 5 : ${this.presenterWidth * 10}) = ${x}`);
      return depth;
  }

  private getAudienceArray(): any {
    let audienceArray = [];
    const leftOffset = (this.sideCapture / 1.9) + this.audienceDistance;
    const rowOffsetVertical = this.presenterWidth * 5; // fudged number
    //const rowOffsetHorizontal = this.audienceWidth; //(.1 * this.stageWidth) + this.audienceWidth;
    const audienceDepth = this.audienceDepth;

    const audienceRowWidth = this.stageWidth; //.8 * this.stageWidth;
    const interRowInterval = this.audienceWidth / SvgStandingPersonComponent.SITTING_TOP_WIDTH_HEIGHT_RATIO; // 1 width of audience
    const intraRowInterval = this.audienceWidth * 2; // 2 widths/depth (height of icon) of audience

    const audiencePerRow = round(audienceRowWidth / ((this.audienceWidth / SvgStandingPersonComponent.SITTING_TOP_WIDTH_HEIGHT_RATIO) + interRowInterval), 0); 
    const aRw = (audiencePerRow * ((this.audienceWidth / SvgStandingPersonComponent.SITTING_TOP_WIDTH_HEIGHT_RATIO) + interRowInterval)) - interRowInterval;
    const rowOffsetHorizontal = (this.stageWidth - aRw) / 1.5; //(.1 * this.stageWidth) + this.audienceWidth;
    const numRows = round(audienceDepth / (this.audienceWidth + intraRowInterval), 2);

    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < audiencePerRow; j++) {
        const audiencePosition = new GraphicPosition(i + j, 
          rowOffsetHorizontal + (j * ((this.audienceWidth / SvgStandingPersonComponent.SITTING_TOP_WIDTH_HEIGHT_RATIO) + interRowInterval)), 
          rowOffsetVertical + (i * (this.audienceWidth + intraRowInterval))
        )
        audienceArray.push(audiencePosition);
      }
    }
    return audienceArray;
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

  private calculateMicrophonePositions(numMicrophones: number, microphoneInterval: number) {
    let microphones: GraphicPosition[] = [];
    const percentageInterval = microphoneInterval / this.calculatorService.lectureWidth * 100;
    if (numMicrophones % 2 === 0) {
      const midpoint = Math.ceil(numMicrophones / 2);
      const midpoints = [midpoint, midpoint + 1];
      microphones.push(new GraphicPosition(midpoint, 50 - (percentageInterval / 2)));
      microphones.push(new GraphicPosition(midpoint, 50 + (percentageInterval / 2)));

      for (let mic = midpoint - 1, i = 1; mic > 0; mic--, i++) {
        let microphonePos = new GraphicPosition(mic, 50 - (percentageInterval / 2) - (i * percentageInterval));
        if (mic === 1) {
          this.microphones.leftMost = 50 - (percentageInterval / 2) - (i * percentageInterval);
        }
        microphones.push(microphonePos);
      }

      for (let mic = midpoint + 2, i = 1; mic <= numMicrophones; mic++, i++) {
        let microphonePos = new GraphicPosition(mic, 50 + (percentageInterval / 2) + (i * percentageInterval));
        if (mic === numMicrophones) {
          this.microphones.rightMost = 50 + (percentageInterval / 2) + (i * percentageInterval);
        }
        microphones.push(microphonePos);
      }

    } else {
      const midpoint = Math.ceil(numMicrophones / 2);
      microphones.push(new GraphicPosition(midpoint, 50));
      for (let mic = midpoint - 1, i = 1; mic > 0; mic--, i++) {
        let microphonePos = new GraphicPosition(mic, 50 - (i * percentageInterval));
        if (mic === 1) {
          this.microphones.leftMost = 50 - (i * percentageInterval);
        }
        microphones.push(microphonePos);
      }

      for (let mic = midpoint + 1, i = 1; mic <= numMicrophones; mic++, i++) {
        let microphonePos = new GraphicPosition(mic, 50 + (i * percentageInterval));
        if (mic === numMicrophones) {
          this.microphones.rightMost = 50 + (i * percentageInterval);
        }
        microphones.push(microphonePos);
      }
    }

    this.microphones.positions = microphones;
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
