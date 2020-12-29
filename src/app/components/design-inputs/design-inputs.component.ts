import { Component, OnInit } from '@angular/core';

import { CalculatorService } from '@app/services/calculator.service';

import { MeasurementUnits } from '@app/models/enums/measurement-units.enum';
import { SoundReinforcementPriority } from '@app/models/enums/sound-reinforcement-priority.enum';

@Component({
  selector: 'app-design-inputs',
  templateUrl: './design-inputs.component.html',
  styleUrls: ['./design-inputs.component.scss']
})
export class DesignInputsComponent implements OnInit {

  public MeasurementUnitsEnum = MeasurementUnits;
  public SoundReinforcementPriorityEnum = SoundReinforcementPriority;

  public measurementUnit: MeasurementUnits = MeasurementUnits.Meters;
  public soundReinforcementPriority: SoundReinforcementPriority = SoundReinforcementPriority.AudioQuality;



  constructor(
    public calculatorService: CalculatorService,
  ) {} 

  ngOnInit() {
  }

  clicky() {
    console.log('shit');
  }

}
