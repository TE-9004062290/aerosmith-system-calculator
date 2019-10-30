import { Component, OnInit } from '@angular/core';

import { CalculatorService } from '@app/services/calculator.service';

@Component({
  selector: 'app-calculation-outputs',
  templateUrl: './calculation-outputs.component.html',
  styleUrls: ['./calculation-outputs.component.scss']
})
export class CalculationOutputsComponent implements OnInit {

  constructor(public calculatorService: CalculatorService) { }

  ngOnInit() {
  }

}
