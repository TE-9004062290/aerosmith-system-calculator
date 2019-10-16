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

  public majorAxis: 'width' | 'height' | 'square' = 'square';
  public widthHeightRatio: number = 1;

  private containerHeight: number = 500;
  private stageWidthPercentage: number = 100;
  private stageHeightPercentage: number = 100;
  private stageTopOffsetPercentage: number = 0;

  private presenterWidthPercentage: number = 0;

  private innerElementWidth: number = 1;
  
  @ViewChild('resizer', null) resizerRef: ElementRef;
  @ViewChild('container', null) containerRef: ElementRef;

  constructor(public calculatorService: CalculatorService) { }

  ngOnInit() {
    this.containerHeight = this.resizerRef.nativeElement.offsetWidth / 3;
    this.calculatorService.$recalculate.subscribe(recalc => {
      if (recalc) {
        this.calculateProportions();
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.containerHeight = this.resizerRef.nativeElement.offsetWidth / 3;
    this.calculateProportions();
  }

  private calculateProportions() {
    this.majorAxis = this.getMajorAxis();
    this.widthHeightRatio = this.getWidthHeightRatio();
    this.stageWidthPercentage = this.getStageWidthPercentage();
    this.stageHeightPercentage = this.getStageHeightPercentage();
    this.stageTopOffsetPercentage = this.getStageTopOffsetPercentage();
    this.presenterWidthPercentage = this.getPresenterWidthPercentage();
    // setTimeout(() => {
    //   console.log(parseInt(getComputedStyle(this.resizerRef.nativeElement).width));
    // }, 1000);
  }

  private getMajorAxis(): 'width' | 'height' | 'square' {
    const cService = this.calculatorService;
    if (cService.lectureWidth === cService.ceilingHeight) {
      return 'square';
    } else {
      return cService.lectureWidth > cService.ceilingHeight ? 'width' : 'height';
    }
  }

  private getWidthHeightRatio(): number {
    return this.calculatorService.lectureWidth / this.calculatorService.ceilingHeight;
  }

  private getStageWidthPercentage(): number {
    switch (this.majorAxis) {
      case 'width':
      case 'square':
        return 100;
      case 'height':
        return this.calculatorService.lectureWidth / this.calculatorService.ceilingHeight * 100;
    }
  }

  private getStageHeightPercentage(): number {
    switch (this.majorAxis) {
      case "width":
        return this.calculatorService.ceilingHeight / this.calculatorService.lectureWidth * 100;
      case "height":
      case "square":
        return 100;
    }
  }

  private getStageTopOffsetPercentage(): number {
    if (this.majorAxis === "width") {
      return (100 - this.stageHeightPercentage) / 2;
    }
    return 0;
  }

  private getPresenterWidthPercentage(): number {
    const cService = this.calculatorService;
    const presenterCeilingRatio = cService.presenterHeight / cService.ceilingHeight;

    return presenterCeilingRatio * this.containerHeight * SvgStandingPersonComponent.WIDTH_HEIGHT_RATIO / (this.majorAxis === 'width' ? this.widthHeightRatio : 1);
  }
}
