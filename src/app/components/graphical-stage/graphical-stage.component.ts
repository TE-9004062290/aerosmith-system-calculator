import { Component, OnInit, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CalculatorService } from '@app/services/calculator.service';
// import { SvgStandingPersonComponent } from '@components/svg-standing-person';

import { SvgStandingPersonComponent } from '@components/svg-standing-person/svg-standing-person.component';
import { MeasurementUnits } from '@app/models/enums/measurement-units.enum';

enum RatioMode {
  Height,
  Width,
  HalfSquareWidth
}

@Component({
  selector: 'app-graphical-stage',
  templateUrl: './graphical-stage.component.html',
  styleUrls: ['./graphical-stage.component.scss']
})
export class GraphicalStageComponent implements OnInit {

  public CalculatorMins = this.calculatorService.MINIMUMS;
  public CalculatorMaxes = this.calculatorService.MAXIMUMS;

  public ratioMode: RatioMode = RatioMode.Width;
  public RatioModeEnum = RatioMode;

  public stageHeight: number = 500;
  public stageWidth: number = 500;
  
  private pageHeight: number = 500;
  private pageWidth: number = 500;

  private wrapperWidth: number = 500;
  private wrapperHeight: number = 500;
  private containerWidth: number = 500;
  private containerHeight: number = 500;


  public widthHeightRatio: number = 1;
  public captureWidthPercentage: number = 0;
  public capturePosition: number = 0;

  public cHeight: number = 0;

  public presenterWidthPercentage: number = 0;
  
  @ViewChild('wrapper', null) wrapperRef: ElementRef;
  @ViewChild('container', null) containerRef: ElementRef;
  @ViewChild('stage', null) stageRef: ElementRef;

  constructor(public calculatorService: CalculatorService) { }

  ngOnInit() {
    this.calculatorService.$recalculate.subscribe(recalc => {
      if (recalc) {
        this.calculateProportions();
      }
    });
    this.snapshotPageDimensions();
    this.snapshotContainerDimensions();

    this.stageWidth = this.stageRef ? this.stageRef.nativeElement.offsetWidth : this.stageWidth;
    this.calculateProportions();
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

    this.presenterWidthPercentage = this.getPresenterWidthPercentage();
    this.captureWidthPercentage = this.getRadiusWidthPercentage();
    this.capturePosition = this.getRadiusLeftPosition(null);
  }

  private calculateStageHeight(mode: RatioMode) {
    switch (mode) {
      case RatioMode.Height:
        return this.pageHeight / 2.5;
      case RatioMode.HalfSquareWidth:
        return this.pageHeight / 2 * this.calculatorService.ceilingHeight / this.calculatorService.lectureWidth;
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
      return widthHeightRatio <= 2 ? RatioMode.HalfSquareWidth : RatioMode.Width;
    } else {
      return RatioMode.Height;
    }
  }

  private calculateWidthHeightRatio(): number {
    return this.calculatorService.lectureWidth / this.calculatorService.ceilingHeight;
  }

  private getPresenterWidthPercentage(): number {
    const cService = this.calculatorService;
    const presenterCeilingRatio = cService.presenterHeight / cService.ceilingHeight;
    return presenterCeilingRatio * this.stageHeight * SvgStandingPersonComponent.WIDTH_HEIGHT_RATIO;
  }

  private getRadiusWidthPercentage(): number {
    const unitlessDiameter = this.calculatorService.measurementUnit === MeasurementUnits.Meters ? 4 : 4 * CalculatorService.METERS_TO_FEET;
    const captureDiameterWidthRatio = unitlessDiameter / this.calculatorService.lectureWidth;
    return captureDiameterWidthRatio * 100;
  }

  private getRadiusLeftPosition(numMicrophone): number {
    const cService = this.calculatorService;
    const captureDiameterWidthRatio = 4 / cService.lectureWidth;
    const captureWidthRadiusPerc = captureDiameterWidthRatio * 100 / 2;

    // if (!numMicrophone) {
    //   return 50 - captureWidthRadiusPerc;
    // } else {
    //   return 50 - captureWidthRadiusPerc;
    // }
    return 50;
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
}
