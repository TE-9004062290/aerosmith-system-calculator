import { Component, OnInit, Output, EventEmitter, Input, OnChanges, ViewChild, ElementRef } from '@angular/core';
import TechnicalSupportLinks from '@app/config/technical-support.json';
import LicensesText from '@app/config/LICENSES.json';
import { MatLegacyDialog as MatDialog, MatLegacyDialogConfig as MatDialogConfig } from '@angular/material/legacy-dialog';

import {
  trigger,
  style,
  animate,
  transition,
} from '@angular/animations';

import { CalculatorService } from '@app/services/calculator.service';
import { MeasurementUnits } from '@app/models/enums/measurement-units.enum';
import { LicenseDialogComponent } from '../license-dialog/license-dialog.component';
import { CalculationTheatreComponent } from '@app/main/calculation-theatre/calculation-theatre.component';


@Component({
  selector: 'app-calculation-inputs',
  templateUrl: './calculation-inputs.component.html',
  styleUrls: ['./calculation-inputs.component.scss'],
  animations: [
    trigger('animateToggle', [
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

  constructor(
    public calculatorService: CalculatorService,
    private matDialog: MatDialog,
    private calsulationTheare : CalculationTheatreComponent
  ) { }

  public MeasurementUnitsEnum = MeasurementUnits;
  public CalculatorDefaults = this.calculatorService.DEFAULTS;
  public CalculatorMins = this.calculatorService.MINIMUMS;
  public CalculatorMaxes = this.calculatorService.MAXIMUMS;

  public showAdvancedSettings: boolean = false;
  public showRestorefromUrl: boolean = false;
  public showTechnicalSupport: boolean = false;

  public technicalSupportLinks = TechnicalSupportLinks;
  public licensesText: string = LicensesText.content;

  public updateBtnEnabled: boolean = false;
  public updateBtnDisabled: boolean = true;

  public textareaContents: string = null;

  public errorMassage: boolean = false;

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

  public toggleRestorefromUrl() {
    this.showRestorefromUrl = !this.showRestorefromUrl;
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

  public clickUpdateBtn() {
      const searchString = "/calculator?";
      let index = this.textareaContents.indexOf(searchString);

      if(index !== -1) {
        let paramsStr = this.textareaContents.substring(index + searchString.length);
        let paramaters = {};
        paramsStr.slice(0).split('&').forEach( function(param) {
           let pair = param.split('=');
           paramaters[pair[0]] = decodeURIComponent(pair[1] || '');
        });

        this.calsulationTheare.restoreFromUrl(paramaters);
        this.errorMassage = false;
      } else {
        this.errorMassage = true;
      }
  }

  public inputTextarea() {
      const textArea = <HTMLInputElement>document.getElementById('restore-textarea');
        if (textArea.value.trim().length > 0) {
          this.updateBtnEnabled = true;
          this.updateBtnDisabled = false;
          this.textareaContents = textArea.value;
        } else {
          this.updateBtnDisabled = true;
          this.updateBtnEnabled = false;
          this.textareaContents = null;
        }
  }
}
