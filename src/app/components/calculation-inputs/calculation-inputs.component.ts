import { Component, OnInit, Output, EventEmitter, Input, OnChanges, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import TechnicalSupportLinks from '@app/config/technical-support.json';
import LicensesText from '@app/config/LICENSES.json';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import {
  trigger,
  style,
  animate,
  transition,
} from '@angular/animations';

import { CalculatorService } from '@app/services/calculator.service';
import { MeasurementUnits } from '@app/models/enums/measurement-units.enum';
import { LicenseDialogComponent } from '../license-dialog/license-dialog.component';


@Component({
    selector: 'app-calculation-inputs',
    templateUrl: './calculation-inputs.component.html',
    styleUrls: ['./calculation-inputs.component.scss'],
    animations: [
        trigger('animateToggle', [
            transition(':enter', [
                style({ height: '0px' }),
                style({ opacity: 0 }),
                animate('.25s', style({ height: '*' })),
                animate('.075s', style({ opacity: 1 }))
            ]),
            transition(':leave', [
                style({ opacity: 1 }),
                style({ height: '*' }),
                animate('.075s', style({ opacity: 0 })),
                animate('.25s', style({ height: '0px' }))
            ])
        ])
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CalculationInputsComponent implements OnInit {

  constructor(
    public calculatorService: CalculatorService,
    private matDialog: MatDialog
  ) { }

  public MeasurementUnitsEnum = MeasurementUnits;
  public CalculatorDefaults = this.calculatorService.DEFAULTS;
  public CalculatorMins = this.calculatorService.MINIMUMS;
  public CalculatorMaxes = this.calculatorService.MAXIMUMS;

  public showAdvancedSettings: boolean = false;
  public showTechnicalSupport: boolean = false;

  public technicalSupportLinks = TechnicalSupportLinks;
  public licensesText: string = LicensesText.content;

  @Input() measurementUnit: MeasurementUnits = MeasurementUnits.Meters;
  
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

  public toggleTechnicalSupport() {
    this.showTechnicalSupport = !this.showTechnicalSupport;
  }
  
  public updateInput(inputField, inputElement) {
    let numerical = parseFloat(inputElement.value);
    const cService = this.calculatorService;
    if (inputField in { 'ceilingHeight': null, 
      'lectureWidth': null, 
      'presenterHeight': null, 
      'audienceHeight': null, 
      'audienceDepth': null, 
      'inputExtenderLength': null,
      'inputAudienceExtenderLength': null,
     }) {
      cService[inputField] = numerical; // Rely on model logic implemented in setter
      inputElement.value = cService[inputField];
    }

    switch (inputField) {
      case 'inputAudienceExtenderLength':
        this.calculatorService.inputAudienceExtenderPristine = false;
        break;
      case 'inputExtenderLength':
        this.calculatorService.inputExtenderPristine = false;
        break;
        
    }
  }

  public openLicenseDialog(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.height = "800px";
    dialogConfig.width = "800px";
    dialogConfig.data = { content: this.licensesText };
    dialogConfig.panelClass = "custom-dialog-container";

    this.matDialog.open(LicenseDialogComponent, dialogConfig);
  }
}
