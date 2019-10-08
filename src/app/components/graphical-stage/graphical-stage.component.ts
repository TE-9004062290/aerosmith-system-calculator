import { Component, OnInit, Input } from '@angular/core';
import { CalculatorService } from '@app/services/calculator.service';


@Component({
  selector: 'app-graphical-stage',
  templateUrl: './graphical-stage.component.html',
  styleUrls: ['./graphical-stage.component.scss']
})
export class GraphicalStageComponent implements OnInit {

  constructor(public calculatorService: CalculatorService) { }

  ngOnInit() {
  }

  get majorAxis() {
    if (this.calculatorService.inputs["lectureWidth"] === this.calculatorService.inputs["ceilingHeight"]) {
      return "square";
    } else {
      return this.calculatorService.inputs["lectureWidth"] > this.calculatorService.inputs["ceilingHeight"] ? "width" : "height";
    }
  }

  get ratio() {
    return this.calculatorService.inputs["lectureWidth"] / this.calculatorService.inputs["ceilingHeight"];
  }

  get stageWidth() {
    switch (this.majorAxis) {
      case "width":
      case "square":
        return 100;
      case "height":
        return this.calculatorService.inputs["lectureWidth"] / this.calculatorService.inputs["ceilingHeight"] * 100;
    }
  }

  get stageHeight() {
    switch (this.majorAxis) {
      case "width":
        return this.calculatorService.inputs["ceilingHeight"] / this.calculatorService.inputs["lectureWidth"] * 100;
      case "height":
      case "square":
        return 100;
    }
  }

  get top() {
    if (this.majorAxis === "width") {
      return (100 - this.stageHeight) / 2;
    }
    return 0;
  }

  get presenterHeight() {
    const majorAxisLength = this.majorAxis === "width" ? this.calculatorService.inputs["lectureWidth"] : this.calculatorService.inputs["ceilingHeight"];
    if (this.majorAxis === "width") {
      return 1 / majorAxisLength * 50;
    } else if (this.majorAxis === "height") {
      return 1 / majorAxisLength / this.ratio * 50;
    } else if (this.majorAxis === "square") {
      return 1 / majorAxisLength * 50;
    }
  }
}
