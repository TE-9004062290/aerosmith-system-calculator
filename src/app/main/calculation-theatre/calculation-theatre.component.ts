import { Component, OnInit } from '@angular/core';
import { CalculatorService } from '@app/services/calculator.service';

import {
  trigger,
  style,
  animate,
  transition,
} from '@angular/animations';

import { MeasurementUnits } from '@app/models/enums/measurement-units.enum';
import { CalculationInputs } from '@app/models/calculation-inputs.model';
import { CalculationOutputs } from '@app/models/calculation-outputs.model';

@Component({
  selector: 'app-calculation-theatre',
  templateUrl: './calculation-theatre.component.html',
  styleUrls: ['./calculation-theatre.component.scss'],
  animations: [
    trigger('animateOutputArea', [
      transition(':enter', [
        style({ height: '0px'}),
        style({ opacity: 0 }),
        animate('.25s', style({ height: '*'})),
        animate('.5s', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        style({ height: '*' }),
        animate('.075s', style({ opacity: 0 })),
        animate('.25s', style({ height: '0px' }))
      ])
    ])
  ]
})
export class CalculationTheatreComponent implements OnInit {

  public MeasurementUnitsEnum = MeasurementUnits;

  public inputGroup: CalculationInputs = new CalculationInputs();
  public measurementUnit: MeasurementUnits = MeasurementUnits.Meters;
  public calculationPriority: 'quality' | 'capture-area' = 'quality';

  public showOutputs = false;

  constructor(public calculatorService: CalculatorService) { }

  ngOnInit() {
  }

  calculate() {
    this.showOutputs = !this.showOutputs;
  }
}
