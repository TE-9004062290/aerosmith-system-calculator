import { Component, OnInit, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CalculatorService } from '@app/services/calculator.service';
// import { SvgStandingPersonComponent } from '@components/svg-standing-person';

import { SvgStandingPersonComponent } from '@components/svg-standing-person/svg-standing-person.component';


@Component({
  selector: 'app-graphical-stage',
  templateUrl: './graphical-stage.component.html',
  styleUrls: ['./graphical-stage.component.scss']
})
export class GraphicalStageComponent implements OnInit {

  public CalculatorMins = CalculatorService.MINIMUMS;
  public CalculatorMaxes = CalculatorService.MAXIMUMS;

  public majorAxis: 'width' | 'height' | 'square' = 'square';
  public pageHeight: number = 500;

  public widthHeightRatio: number = 1;
  public captureWidthPercentage: number = 0;
  public stageWidth: number = 500;
  public capturePosition: number = 0;

  private containerHeight: number = 500;
  private wrapperWidth: number = 500;
  public cHeight: number = 0;
  public halfSquare: boolean = false;
  private stageWidthPercentage: number = 100;
  private stageHeightPercentage: number = 100;
  private stageTopOffsetPercentage: number = 0;

  public presenterWidthPercentage: number = 0;

  private innerElementWidth: number = 1;
  
  @ViewChild('resizer', null) resizerRef: ElementRef;
  @ViewChild('container', null) containerRef: ElementRef;
  @ViewChild('wrapper', null) wrapperRef: ElementRef;
  @ViewChild('stage', null) stageRef: ElementRef;

  constructor(public calculatorService: CalculatorService) { }

  ngOnInit() {
    this.containerHeight = this.resizerRef ? this.resizerRef.nativeElement.offsetWidth / 1 : 0;
    this.calculatorService.$recalculate.subscribe(recalc => {
      if (recalc) {
        this.calculateProportions();
      }
    });
    this.pageHeight = window.innerHeight;
    this.wrapperWidth = this.wrapperRef ? this.wrapperRef.nativeElement.offsetWidth : this.wrapperWidth;
    this.stageWidth = this.stageRef ? this.stageRef.nativeElement.offsetWidth : this.stageWidth;
    this.calculateProportions();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.containerHeight = this.resizerRef ? this.resizerRef.nativeElement.offsetWidth / 1 : 0;
    this.wrapperWidth = this.wrapperRef ? this.wrapperRef.nativeElement.offsetWidth : this.wrapperWidth;
    this.stageWidth = this.stageRef ? this.stageRef.nativeElement.offsetWidth / 1 : this.stageWidth;
    this.pageHeight = window.innerHeight;
    this.calculateProportions();
  }

  private calculateProportions() {
    this.majorAxis = this.getMajorAxis();
    this.widthHeightRatio = this.getWidthHeightRatio();

    this.halfSquare = this.widthHeightRatio <= 2;
    this.cHeight = this.wrapperWidth * (this.halfSquare ? 0.75 : .9) * this.calculatorService.ceilingHeight / this.calculatorService.lectureWidth;
    if (this.halfSquare) {
      this.cHeight = 500 / this.widthHeightRatio; // determine max width and half it
    }
    if (this.majorAxis === 'height') {
      this.cHeight = 600;
    }

    this.presenterWidthPercentage = this.getPresenterWidthPercentage();
    this.captureWidthPercentage = this.getRadiusWidthPercentage();
    this.capturePosition = this.getRadiusLeftPosition(null);
  }

  private calculateStageHeight() {

  }
  
  private getMajorAxis(): 'width' | 'height' | 'square' {
    const cService = this.calculatorService;
    // if (Math.abs(cService.lectureWidth - cService.ceilingHeight) <= 2) {
    //   return 
    // }
    if (cService.lectureWidth === cService.ceilingHeight) {
      return 'square';
    } else {
      return cService.lectureWidth > cService.ceilingHeight ? 'width' : 'height';
    }
  }

  private getWidthHeightRatio(): number {
    return this.calculatorService.lectureWidth / this.calculatorService.ceilingHeight;
  }

  private getPresenterWidthPercentage(): number {
    const cService = this.calculatorService;
    const presenterCeilingRatio = cService.presenterHeight / cService.ceilingHeight;
    // return presenterCeilingRatio * this.cHeight * SvgStandingPersonComponent.WIDTH_HEIGHT_RATIO / (this.majorAxis === 'width' ? this.widthHeightRatio : 1);
    return presenterCeilingRatio * this.cHeight * SvgStandingPersonComponent.WIDTH_HEIGHT_RATIO;
  }

  private getRadiusWidthPercentage(): number {
    const captureDiameterWidthRatio = 4 / this.calculatorService.lectureWidth;
    return captureDiameterWidthRatio * 100;
  }

  private getRadiusLeftPosition(numMicrophone): number {
    const cService = this.calculatorService;
    const captureDiameterWidthRatio = 4 / cService.lectureWidth;
    const captureWidthRadiusPerc = captureDiameterWidthRatio * 100 / 2;

    // const captureDiameterPixelWidth = this.stageWidth * captureDiameterWidthRatio;
    // const center = captureDiameterPixelWidth / 2;
    // const stageCenter = this.stageWidth / 2;
    // const toMove = stageCenter - center;
    // return toMove;
    if (!numMicrophone) {
      return 50 - captureWidthRadiusPerc;
    } else {
      return 50 - captureWidthRadiusPerc;
    }
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
