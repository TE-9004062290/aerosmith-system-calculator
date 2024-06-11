import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


import { CalculatorService } from '@app/services/calculator.service';
import { MixpanelService } from '@app/services/mixpanel.service';

import { environment } from 'environments/environment';

import {
  trigger,
  style,
  animate,
  transition,
} from '@angular/animations';

import { MeasurementUnits } from '@app/models/enums/measurement-units.enum';
import { SoundReinforcementPriority } from '@app/models/enums/sound-reinforcement-priority.enum';

@Component({
  selector: 'app-calculation-theatre',
  templateUrl: './calculation-theatre.component.html',
  styleUrls: ['./calculation-theatre.component.scss'],
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
export class CalculationTheatreComponent implements OnInit {

  public MeasurementUnitsEnum = MeasurementUnits;
  public SoundReinforcementPriorityEnum = SoundReinforcementPriority;

  public measurementUnit: MeasurementUnits = MeasurementUnits.Meters;
  public soundReinforcementPriority: SoundReinforcementPriority = SoundReinforcementPriority.AudioQuality;

  public sideBarOut = false;

  public numDesignActive: number = 0;
  
  public showRestorefromUrl: boolean = false;

  public updateBtnEnabled: boolean = false;
  public updateBtnDisabled: boolean = true;

  public textareaContents: string = null;

  public errorMassage: boolean = false;

  constructor(
    public calculatorService: CalculatorService,
    public mixpanelService: MixpanelService) {} 

  ngOnInit() {
    
    window.addEventListener('keypress', (e) => {
      if (e.key === '*') {
        this.calculatorService.autoCalculateOutput = !this.calculatorService.autoCalculateOutput;
      }
    });

    this.numDesignActive = this._countDesignActive();
    this.calculatorService.$recalculate.subscribe(recalc => {
      if (recalc) {
        this.numDesignActive = this._countDesignActive();
      }
    });
  }

  public calculate(track: boolean = false) {
    this.calculatorService.calculateOutputs();
    this.calculatorService.$recalculate.next(true);
    this.hideSideBar();
    
    if (environment.production && track) {
      this.mixpanelService.trackCalculation();
    }
  }

  public toggleSideBar() {
    this.sideBarOut = !this.sideBarOut;
  }

  public hideSideBar() {
    this.sideBarOut = false;
  }

  private _countDesignActive() {
    const designModes = [
      this.calculatorService.reinforcePresenter,
      this.calculatorService.recordPresenter,
      this.calculatorService.recordAudience
    ]
    return designModes.filter(mode => mode).length;
  }

  private parseParams(params) {
    const { 
      ceilingHeight, lectureWidth, presenterHeight, audienceHeight, audienceDepth,
      inputExtenderLength, inputAudienceExtenderLength, measurementUnit, 
      reinforcePresenter, recordPresenter, recordAudience, reinforcementPriority } = params;

    switch (measurementUnit) {
      case 'ft':
        this.calculatorService.measurementUnit = MeasurementUnits.Feet;
        break;
      case 'm':
        this.calculatorService.measurementUnit = MeasurementUnits.Meters;
        break;
      default:
        this.calculatorService.measurementUnit = MeasurementUnits.Meters;
        break;
    }

    if (this.isNumber(ceilingHeight)) {
      this.calculatorService.ceilingHeight = ceilingHeight;
    } else {
      this.calculatorService.ceilingHeight = this.calculatorService.DEFAULTS.ceilingHeight;
    }
    if (this.isNumber(lectureWidth)) {
      this.calculatorService.lectureWidth = lectureWidth;
    } else {
      this.calculatorService.lectureWidth = this.calculatorService.DEFAULTS.lectureWidth;
    }
    if (this.isNumber(presenterHeight)) {
      this.calculatorService.presenterHeight = presenterHeight;
    } else {
      this.calculatorService.presenterHeight = this.calculatorService.DEFAULTS.presenterHeight;
    }
    if (this.isNumber(audienceHeight)) {
      this.calculatorService.audienceHeight = audienceHeight;
    } else {
      this.calculatorService.audienceHeight = this.calculatorService.DEFAULTS.audienceHeight;
    }
    if (this.isNumber(audienceDepth)) {
      this.calculatorService.audienceDepth = audienceDepth;
    } else {
      this.calculatorService.audienceDepth = this.calculatorService.DEFAULTS.audienceDepth;
    }
    if (this.isNumber(inputExtenderLength)) {
      this.calculatorService.inputExtenderLength = inputExtenderLength;
    } else {
      this.calculatorService.inputExtenderLength = 0;
    }
    if (this.isNumber(inputAudienceExtenderLength)) {
      this.calculatorService.inputAudienceExtenderLength = inputAudienceExtenderLength;
    } else {
      this.calculatorService.inputAudienceExtenderLength = 0;
    }

    if (reinforcePresenter) {
      this.calculatorService.reinforcePresenter = !!(+reinforcePresenter);
    } else {
      this.calculatorService.reinforcePresenter = true;
    }

    if (recordPresenter) {
      this.calculatorService.recordPresenter = !!(+recordPresenter);
    } else {
      this.calculatorService.recordPresenter = false;
    }

    if (recordAudience) {
      this.calculatorService.recordAudience = !!(+recordAudience);
    } else {
      this.calculatorService.recordAudience = false;
    }

    switch (reinforcementPriority) {
      case 0:
      case '0':
        this.calculatorService.soundReinforcementPriority = SoundReinforcementPriority.AudioQuality;
        break;
      case 1:
      case '1':
        this.calculatorService.soundReinforcementPriority = SoundReinforcementPriority.DetectionRange;
        break;
      default:
        this.calculatorService.soundReinforcementPriority = SoundReinforcementPriority.AudioQuality;
        break;
    }
  }

  private isNumber(param) {
    const pattern = /^([1-9]\d*|0)(\.\d+)?$/;
    return pattern.test(param);
  }

  private restoreFromUrl(params) {
    this.parseParams(params);
    this.calculate(false);
  }

  public toggleRestorefromUrl() {
    this.showRestorefromUrl = !this.showRestorefromUrl;
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

      this.restoreFromUrl(paramaters);
      this.errorMassage = false;
    } else {
      this.errorMassage = true;
    }
  }

  public focusTextarea() {
    document.getElementById('restore-textarea').addEventListener('keydown',
      function (event) {
        if (event.key == "Enter") {
          const updateButton = document.getElementById('restore-btn')
          updateButton.click();
        }
      });
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
