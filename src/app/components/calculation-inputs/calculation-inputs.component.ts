import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';

import {
  trigger,
  style,
  animate,
  transition,
} from '@angular/animations';

import { CalculatorService } from '@app/services/calculator.service';
import { MeasurementUnits } from '@app/models/enums/measurement-units.enum';


@Component({
  selector: 'app-calculation-inputs',
  templateUrl: './calculation-inputs.component.html',
  styleUrls: ['./calculation-inputs.component.scss'],
  animations: [
    trigger('animateAdvancedSettings', [
      transition(':enter', [
        style({ height: '0px'}),
        style({ opacity: 0 }),
        animate('.25s', style({ height: '*'})),
        animate('.075s', style({ opacity: 1 }))
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
export class CalculationInputsComponent implements OnInit {

  constructor(public calculatorService: CalculatorService) { }

  public MeasurementUnitsEnum = MeasurementUnits;
  public CalculatorDefaults = this.calculatorService.DEFAULTS;
  public CalculatorMins = this.calculatorService.MINIMUMS;
  public CalculatorMaxes = this.calculatorService.MAXIMUMS;

  @Input() measurementUnit: MeasurementUnits = MeasurementUnits.Meters;

  public showAdvancedSettings: boolean = false;
  
  ngOnInit() {
    this.calculatorService.$recalculate.subscribe(recalc => {
      if (recalc) {
        this.CalculatorMins = this.calculatorService.MINIMUMS;
        this.CalculatorMaxes = this.calculatorService.MAXIMUMS;
      }
    });
  }

  public toggleAdvancedSettings() {
    this.showAdvancedSettings = !this.showAdvancedSettings;
  }
  
  public updateInput(inputField, inputElement) {
    let numerical = parseFloat(inputElement.value);
    const cService = this.calculatorService;
    if (inputField in { 'ceilingHeight': null, 'lectureWidth': null, 'presenterHeight': null, 'audienceHeight': null, 'inputExtenderLength': null }) {
      cService[inputField] = numerical; // Rely on model logic implemented in setter
      inputElement.value = cService[inputField];
    }
  }
}
