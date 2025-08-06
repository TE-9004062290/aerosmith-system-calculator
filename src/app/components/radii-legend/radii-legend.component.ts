import { Component, OnInit } from '@angular/core';
import { CalculatorService } from '@app/services/calculator.service';

@Component({
    selector: 'app-radii-legend',
    templateUrl: './radii-legend.component.html',
    styleUrls: ['./radii-legend.component.scss'],
    standalone: false
})
export class RadiiLegendComponent implements OnInit {

  constructor(
    public calculatorService: CalculatorService
  ) { }

  ngOnInit() {
  }

  public togglePresenterReinforcement(val: boolean) {
    this.calculatorService.displayPresenterRecording = val;
    this.calculatorService.displayAudienceRecording = val;
  }

  public togglePresenterRecording(val: boolean) {
    this.calculatorService.displayPresenterReinforcement = val;
    this.calculatorService.displayAudienceRecording = val;
  }

  public toggleAudienceRecording(val: boolean) {
    this.calculatorService.displayPresenterReinforcement = val;
    this.calculatorService.displayPresenterRecording = val;
  }
}
