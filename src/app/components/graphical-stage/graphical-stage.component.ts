import { Component, OnInit, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CalculatorService } from '@app/services/calculator.service';
import { GraphicsService } from '@app/services/graphics.service';

import { SvgStandingPersonComponent } from '@components/svg-standing-person/svg-standing-person.component';
import { MeasurementUnits } from '@app/models/enums/measurement-units.enum';

import {
  trigger,
  style,
  animate,
  transition,
} from '@angular/animations';


enum RatioMode {
  Height,
  Width,
  HalfSquareWidth
}

class GraphicPosition {
  public number: number = 0;
  public positionPercentage: number = 50;

  public trackingFunc() {
    return this.number;
  }

  constructor(num, positionPerc) {
    this.number = num;
    this.positionPercentage = positionPerc;
  }
}

@Component({
  selector: 'app-graphical-stage',
  templateUrl: './graphical-stage.component.html',
  styleUrls: ['./graphical-stage.component.scss'],
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
export class GraphicalStageComponent implements OnInit {

  public CalculatorMins = this.calculatorService.MINIMUMS;
  public CalculatorMaxes = this.calculatorService.MAXIMUMS;

  public ratioMode: RatioMode = RatioMode.Width;
  public RatioModeEnum = RatioMode;

  public stageHeight: number = 500;
  public stageWidth: number = 500;
  public inputExtenderLength: number = 0;
  public extenderLength: number = 0;
  public extenderSideLength: number = 0;
  
  private pageHeight: number = 500;
  private pageWidth: number = 500;

  private wrapperWidth: number = 500;
  private wrapperHeight: number = 500;
  private containerWidth: number = 500;
  private containerHeight: number = 500;
  public sideWrapperWidth: number = 500;
  public sideWrapperHeight: number = 500;
  public sideInnerContainerWidth: number = 500;


  public widthHeightRatio: number = 1;
  public sideCapture: number = 0;
  public captureWidthPercentage: number = 0;
  public capturePosition: number = 0;
  public captureTop: number = 0;

  public microphones = { leftMost: 0, rightMost: 0, positions: []};
  public persons = { leftMost: 0, rightMost: 0, positions: []};

  public presenterWidth: number = 0;
  public presenterSideWidth: number = 0;
  public audienceWidth: number = 0;
  public audienceDistance: number = 0;
  public audience: number[] = [];
  
  @ViewChild('wrapper', null) wrapperRef: ElementRef;
  @ViewChild('container', null) containerRef: ElementRef;
  @ViewChild('stage', null) stageRef: ElementRef;
  @ViewChild('sideWrapper', null) sideWrapperRef: ElementRef;
  @ViewChild('sideInnerContainer', null) sideInnerContainerRef: ElementRef;

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

    this.sideWrapperWidth = this.sideWrapperRef ? this.sideWrapperRef.nativeElement.offsetWidth : this.sideWrapperWidth;
    this.sideWrapperHeight = this.sideWrapperRef ? this.sideWrapperRef.nativeElement.offsetHeight : this.sideWrapperHeight;
    this.sideInnerContainerWidth = this.sideInnerContainerRef ? this.sideInnerContainerRef.nativeElement.offsetWidth : this.sideInnerContainerWidth;
  }

  private calculateProportions() {
    //this.ratioMode = this.calculateRatioMode();
    this.calculateRatioMode();
    this.widthHeightRatio = this.calculateWidthHeightRatio();

    // this.stageHeight = this.calculateStageHeight(this.ratioMode);
    // this.stageWidth = this.calculateStageWidth(this.ratioMode);
    this.presenterWidth = this.getPresenterWidth();
    this.presenterSideWidth = this.getPresenterSideWidth();
    this.audienceWidth = this.getAudienceWidth();
    this.captureWidthPercentage = this.getRadiusWidthPercentage();
    this.sideCapture = this.getSideRadius();
    this.audienceDistance = this.getAudienceDistance();
    this.captureTop = this.getRadiusTopPosition(null);
    this.audience = this.getAudienceArray();
  }


  private calculateRatioMode() {
    const cService = this.calculatorService;
    const widthHeightRatio = cService.lectureWidth / cService.ceilingHeight;

    if (widthHeightRatio > 1) {
      this.ratioMode = RatioMode.Width;
      this.stageWidth = 60;
      this.stageHeight = this.stageWidth * (cService.ceilingHeight / cService.lectureWidth);
      //return widthHeightRatio < 2 ? RatioMode.HalfSquareWidth : RatioMode.Width;
    } else {
      this.ratioMode = RatioMode.Height;
      this.stageHeight = 50;
      this.stageWidth = this.stageHeight * (widthHeightRatio);
      //return RatioMode.Height;
    }
  }

  private calculateStageHeight(mode: RatioMode) {
    // switch (mode) {
    //   case RatioMode.Height:
    //     return this.pageHeight / 2;
    //   case RatioMode.HalfSquareWidth:
    //     return this.pageHeight / 2;
    //   case RatioMode.Width:
    //     return this.containerWidth * this.calculatorService.ceilingHeight / this.calculatorService.lectureWidth;
    // }
    const height = 100 * this.calculatorService.ceilingHeight / this.calculatorService.lectureWidth;
    if (height <= 40) {
      this.ratioMode = RatioMode.Width;
      return height;
    } else {
      this.ratioMode = RatioMode.Height;
      return 40;
    }
    // return Math.min(35, 100 * this.calculatorService.ceilingHeight / this.calculatorService.lectureWidth);
    // switch (mode) {
    //   case RatioMode.Height:
    //   case RatioMode.HalfSquareWidth:
    //       return 35;
    //   case RatioMode.Width:
    //     return Math.min(35, 100 * this.calculatorService.ceilingHeight / this.calculatorService.lectureWidth);
    // }
  }

  private calculateStageWidth(mode: RatioMode) {
    const width = this.stageHeight * this.calculatorService.lectureWidth / this.calculatorService.ceilingHeight;
    return width;
    switch (mode) {
      case RatioMode.Width:
        return 50.4; // 80vw
      case RatioMode.Height:
        return width;
    }
    // switch (mode) {
    //   case RatioMode.Width:
    //     return 0.9 * this.containerWidth;
    //   case RatioMode.Height:
    //   case RatioMode.HalfSquareWidth:
    //     return Math.min(0.9 * this.containerWidth, this.stageHeight * this.calculatorService.lectureWidth / this.calculatorService.ceilingHeight);
    // }
  }

  private calculateWidthHeightRatio(): number {
    return this.calculatorService.lectureWidth / this.calculatorService.ceilingHeight;
  }

  private getPresenterWidth(): number {
    const cService = this.calculatorService;
    const presenterCeilingRatio = cService.presenterHeight / cService.ceilingHeight;
    return presenterCeilingRatio * this.stageHeight * SvgStandingPersonComponent.FRONT_WIDTH_HEIGHT_RATIO;
  }

  private getPresenterSideWidth(): number {
    const presenterCeilingRatio = this.calculatorService.presenterHeight / this.calculatorService.ceilingHeight;
    return presenterCeilingRatio * this.stageHeight * SvgStandingPersonComponent.SIDE_WIDTH_HEIGHT_RATIO;
  }

  private getAudienceWidth(): number {
    const audienceCeilingRatio = this.calculatorService.audienceHeight / this.calculatorService.ceilingHeight;
    return audienceCeilingRatio * this.stageHeight * SvgStandingPersonComponent.SITTING_WIDTH_HEIGHT_RATIO;
  }

  private getRadiusWidthPercentage(): number {
    const diameter = this.calculatorService.captureRadius * 2;
    const captureDiameterWidthRatio = diameter / this.calculatorService.lectureWidth;
    return captureDiameterWidthRatio * 100;
  }

  private getSideRadius(): number {
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

  private getAudienceDistance(): number {
    if (!this.calculatorService.hasFreshOutput) {
      return this.stageHeight * (1 * this.calculatorService.unitConversion) / this.calculatorService.ceilingHeight;
    }
    return (this.calculatorService.audienceDistance / this.calculatorService.ceilingHeight * this.stageHeight);
  }

  private getAudienceArray(): any {
    let audienceArray = [];
    const leftOffset = (this.sideCapture / 1.9) + this.audienceDistance;
    const effectiveStageWidth = (0.9 *this.sideWrapperWidth) - this.audienceDistance;
    const numAudience = Math.floor(effectiveStageWidth / (2 * this.audienceWidth));
    for (let i = 0; i < numAudience; i++) {
      audienceArray.push(new GraphicPosition(i, leftOffset + 2 * i * this.audienceWidth));
    }
    return audienceArray;
  }

  public updateInput(inputField, inputElement) {
    let numerical = parseFloat(inputElement.value);
    const cService = this.calculatorService;
    if (inputField in { 'ceilingHeight': null, 'lectureWidth': null, 'presenterHeight': null, 'audienceHeight': null, 'inputExtenderLength': null }) {
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
