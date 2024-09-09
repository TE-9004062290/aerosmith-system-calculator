import { Component, OnInit, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CalculatorService } from '@app/services/calculator.service';
import { GraphicsService } from '@app/services/graphics.service';
import { CalculationTheatreComponent } from '@app/main/calculation-theatre/calculation-theatre.component';

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

  private STAGE_PAGE_HEIGHT_RATIO = 0.20;
  public isPrinting = false;
  public CalculatorMins = this.calculatorService.MINIMUMS;
  public CalculatorMaxes = this.calculatorService.MAXIMUMS;

  public ratioMode: RatioMode = RatioMode.Width;
  public RatioModeEnum = RatioMode;

  public stageHeight: number = 500;
  public stageWidth: number = 500;
  public stageHeightTop: number = 500;
  public stageWidthTop: number = 500;
  public inputExtenderLength: number = 0;
  public extenderLength: number = 0;
  public extenderSideLength: number = 0;
  
  private pageHeight: number = 500;
  private pageWidth: number = 500;

  private wrapperWidth: number = 500;
  private wrapperHeight: number = 500;
  private containerWidth: number = 500;
  private containerHeight: number = 500;


  public widthHeightRatio: number = 1;
  public sideCapture: number = 0;
  public secondarySideCapture: number = 0;
  public captureWidthPercentage: number = 0;
  public capturePosition: number = 0;
  public captureTop: number = 0;

  public microphones = { leftMost: 0, rightMost: 0, positions: []};
  public persons = { leftMost: 0, rightMost: 0, positions: []};

  public presenterWidth: number = 0;
  public presenterSideWidth: number = 0;
  public presenterTopWidth: number = 0;
  public audienceWidth: number = 0;
  public audienceTopWidth: number = 0;
  public audienceDistance: number = 0;
  public audience: number[] = [];
  
  @ViewChild('wrapper') wrapperRef: ElementRef;
  @ViewChild('container') containerRef: ElementRef;
  @ViewChild('stage') stageRef: ElementRef;

  constructor(
    public calculatorService: CalculatorService,
    public graphicsService: GraphicsService,
    public calculationTheatreComponent:CalculationTheatreComponent) { }

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
    this.STAGE_PAGE_HEIGHT_RATIO = .2;
    this.snapshotPageDimensions();
    this.snapshotContainerDimensions();
    this.calculateProportions();
  }

  @HostListener('window:afterprint',['$event'])
  onAfterPrint(event) {
    this.isPrinting = false;
    this.STAGE_PAGE_HEIGHT_RATIO = .2;
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
    [this.stageHeight, this.stageWidth, this.ratioMode] = this.calculateStageRatios();

    this.presenterWidth = this.getPresenterWidth();
    this.presenterSideWidth = this.getPresenterSideWidth();
    this.presenterTopWidth = this.getPresenterTopWidth();
    this.audienceWidth = this.getAudienceWidth();
    this.captureWidthPercentage = this.getRadiusWidthPercentage();
    this.sideCapture = this.getSideRadius();
    this.audienceDistance = this.getAudienceDistance();
    this.captureTop = this.getRadiusTopPosition(null);
    this.audience = this.getAudienceArray();
  }

  private calculateStageRatios() {
    const cService = this.calculatorService;
    const heightWidthRatio = cService.ceilingHeight / cService.lectureWidth;
    let stageHeight = 0;
    let stageWidth = 0;
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

    return [stageHeight, stageWidth, ratioMode];
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

  private getPresenterTopWidth(): number {
    // Height doesn't really matter here. Just choose something reasonable. Later, use this.stageHeight / num micradius intersections
    const topIconHeight = this.calculatorService.lectureWidth * 0.14725678156;
    return topIconHeight * SvgStandingPersonComponent.TOP_WIDTH_HEIGHT_RATIO;
  }

  private getAudienceWidth(): number {
    const audienceCeilingRatio = this.calculatorService.audienceHeight / this.calculatorService.ceilingHeight;
    return audienceCeilingRatio * this.stageHeight * SvgStandingPersonComponent.SITTING_WIDTH_HEIGHT_RATIO;
  }

  private getRadiusWidthPercentage(): number {
    const diameter = this.calculatorService.captureRadius * 2;
    let captureDiameterWidthRatio = diameter / this.calculatorService.lectureWidth;
    return captureDiameterWidthRatio * 100;
  }

  private getSideRadius(): number {
    const radius = this.calculatorService.captureRadius;
    const captureRadiusHeightRatio = radius / this.calculatorService.ceilingHeight;
    this.secondarySideCapture = (this.calculatorService.secondaryCaptureRadius / this.calculatorService.ceilingHeight) * this.stageHeight;
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

  private getAudienceDepthSide(): number {
      return this.stageHeight * (this.calculatorService.audienceDepth * this.calculatorService.unitConversion) / this.calculatorService.ceilingHeight;
  }

  private getAudienceArray(): any {
    let audienceArray = [];
    const leftOffset = (this.sideCapture / 1.9) + this.audienceDistance;
    const effectiveStageWidth = this.getAudienceDepthSide() - (1 * this.calculatorService.unitConversion);
    const numAudience = Math.floor(effectiveStageWidth / (2 * this.audienceWidth));
    for (let i = 0; i < numAudience; i++) {
      audienceArray.push(new GraphicPosition(i, leftOffset + 2 * i * this.audienceWidth));
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
      this.calculationTheatreComponent.calculate(true);
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
