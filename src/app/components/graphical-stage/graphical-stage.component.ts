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
    return this.calculatorService.inputs["lectureWidth"] > this.calculatorService.inputs["ceilingHeight"] ? "width" : "height";
  }

  get ratio() {
    return this.calculatorService.inputs["lectureWidth"] / this.calculatorService.inputs["ceilingHeight"];
  }

  get stageWidth() {
    switch (this.majorAxis) {
      case "width":
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
        return 100;
    }
  }

  get top() {
    if (this.majorAxis === "width") {
      return (100 - this.stageHeight) / 2;
    }
    return 0;
  }
}
