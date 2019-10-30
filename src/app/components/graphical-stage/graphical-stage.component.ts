import { Component, OnInit, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CalculatorService } from '@app/services/calculator.service';
import { GraphicsService } from '@app/services/graphics.service';

// import { SvgStandingPersonComponent } from '@components/svg-standing-person';

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
        style({ left: '50%'}),
        style({ opacity: 0 }),
        animate('.25s', style({ left: '*'})),
        animate('.25s', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        style({ left: '*' }),
        animate('.25s', style({ opacity: 0 })),
        animate('.25s', style({ left: '50%' }))
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
  public extenderLength: number = 0;
  
  private pageHeight: number = 500;
  private pageWidth: number = 500;

  private wrapperWidth: number = 500;
  private wrapperHeight: number = 500;
  private containerWidth: number = 500;
  private containerHeight: number = 500;


  public widthHeightRatio: number = 1;
  public captureWidthPercentage: number = 0;
  public capturePosition: number = 0;
  public captureTop: number = 0;

  public microphones = { leftMost: 0, rightMost: 0, positions: []};
  public persons = { leftMost: 0, rightMost: 0, positions: []};

  public presenterWidth: number = 0;
  
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

  ngOnInit() {
    this.calculatorService.$recalculate.subscribe(recalc => {
      if (recalc) {
        this.calculatorService.calculateOutputs();
        this.calculateProportions();
        console.log(this.calculatorService.microphoneInterval);
        this.calculateMicrophonePositions(this.calculatorService.requiredMicrophones, this.calculatorService.microphoneInterval);
        this.calculatePersonPositions(this.calculatorService.requiredMicrophones, this.calculatorService.microphoneInterval);
        console.log(this.microphones);
        console.log(this.persons);
      }
    });
    this.snapshotPageDimensions();
    this.snapshotContainerDimensions();

    this.stageWidth = this.stageRef ? this.stageRef.nativeElement.offsetWidth : this.stageWidth;
    this.calculatorService.calculateOutputs();
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
    this.ratioMode = this.calculateRatioMode();
    this.widthHeightRatio = this.calculateWidthHeightRatio();

    this.stageHeight = this.calculateStageHeight(this.ratioMode);
    this.stageWidth = this.calculateStageWidth(this.ratioMode);

    this.presenterWidth= this.getPresenterWidth();
    this.captureWidthPercentage = this.getRadiusWidthPercentage();
    this.captureTop = this.getRadiusTopPosition(null);
  }

  private calculateStageHeight(mode: RatioMode) {
    switch (mode) {
      case RatioMode.Height:
        return this.pageHeight / 2;
      case RatioMode.HalfSquareWidth:
        return this.pageHeight / 2;
      case RatioMode.Width:
        return this.containerWidth * this.calculatorService.ceilingHeight / this.calculatorService.lectureWidth;
    }
  }

  private calculateStageWidth(mode: RatioMode) {
    switch (mode) {
      case RatioMode.Width:
        return this.containerWidth;
      case RatioMode.Height:
      case RatioMode.HalfSquareWidth:
        return this.stageHeight * this.calculatorService.lectureWidth / this.calculatorService.ceilingHeight;
    }
  }

  private calculateRatioMode() {
    const cService = this.calculatorService;
    const widthHeightRatio = cService.lectureWidth / cService.ceilingHeight;

    if (widthHeightRatio >= 1) {
      return widthHeightRatio < 2 ? RatioMode.HalfSquareWidth : RatioMode.Width;
    } else {
      return RatioMode.Height;
    }
  }

  private calculateWidthHeightRatio(): number {
    return this.calculatorService.lectureWidth / this.calculatorService.ceilingHeight;
  }

  private getPresenterWidth(): number {
    const cService = this.calculatorService;
    const presenterCeilingRatio = cService.presenterHeight / cService.ceilingHeight;
    return presenterCeilingRatio * this.stageHeight * SvgStandingPersonComponent.WIDTH_HEIGHT_RATIO;
  }

  private getRadiusWidthPercentage(): number {
    const unitlessDiameter = this.calculatorService.measurementUnit === MeasurementUnits.Meters ? 4 : 4 * CalculatorService.METERS_TO_FEET;
    const captureDiameterWidthRatio = unitlessDiameter / this.calculatorService.lectureWidth;
    return captureDiameterWidthRatio * 100;
  }

  private getRadiusTopPosition(numMicrophone): number {
    const cService = this.calculatorService;
    this.extenderLength = cService.extenderLength / cService.ceilingHeight * this.stageHeight;
    if (cService.extenderLength > 0) {
      return cService.extenderLength / cService.ceilingHeight * 100;
    }
    return 0;
  }

  public updateInput(inputField, inputElement) {
    let numerical = parseFloat(inputElement.value);
    const cService = this.calculatorService;
    if (inputField in { 'ceilingHeight': null, 'lectureWidth': null, 'presenterHeight': null, 'audienceHeight': null}) {
      if (!isNaN(numerical)) {
        numerical = numerical < this.CalculatorMins[inputField] ? this.CalculatorMins[inputField] 
          : numerical > this.CalculatorMaxes[inputField] ? this.CalculatorMaxes[inputField] : numerical;
      } else {
        numerical= this.CalculatorMins[inputField];
      }
      inputElement.value = numerical;
      cService[inputField] = numerical;
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
