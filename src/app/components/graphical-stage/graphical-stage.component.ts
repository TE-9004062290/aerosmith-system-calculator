import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
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

  private stageWidthPercentage: number = 100;
  private stageHeightPercentage: number = 100;
  private stageTopOffsetPercentage: number = 0;

  private presenterWidthPercentage: number = 0;

  private innerElementWidth: number = 1;
  
  @ViewChild('resizer', null) resizerRef: ElementRef;
  @ViewChild('container', null) containerRef: ElementRef;

  constructor(public calculatorService: CalculatorService) { }

  ngOnInit() {
    this.calculatorService.$recalculate.subscribe(recalc => {
      if (recalc) {
        this.calculateProportions();
      }
    });
  }

  private calculateProportions() {
    this.majorAxis = this.getMajorAxis();
    this.widthHeightRatio = this.getWidthHeightRatio();
    this.stageWidthPercentage = this.getStageWidthPercentage();
    this.stageHeightPercentage = this.getStageHeightPercentage();
    this.stageTopOffsetPercentage = this.getStageTopOffsetPercentage();
    this.presenterWidthPercentage = this.getPresenterWidthPercentage();
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
    if (this.majorAxis === 'width') {
      return (presenterCeilingRatio * (1 / this.widthHeightRatio) ) * SvgStandingPersonComponent.WIDTH_HEIGHT_RATIO * 75;
    } else if (this.majorAxis === 'height') {
      // return presenterCeilingRatio
      return this.calculatorService.presenterHeight / this.calculatorService.ceilingHeight * 100 * 0.3463406889982537 * this.calculatorService.lectureWidth / this.calculatorService.ceilingHeight;
    }
    return 0;
  }
}
