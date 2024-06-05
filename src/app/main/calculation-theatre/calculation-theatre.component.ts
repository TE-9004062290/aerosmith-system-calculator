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
  styleUrls: ['./calculation-theatre.component.scss']
})
export class CalculationTheatreComponent implements OnInit {

  private initialized = false;

  public MeasurementUnitsEnum = MeasurementUnits;
  public SoundReinforcementPriorityEnum = SoundReinforcementPriority;

  public measurementUnit: MeasurementUnits = MeasurementUnits.Meters;
  public soundReinforcementPriority: SoundReinforcementPriority = SoundReinforcementPriority.AudioQuality;

  public sideBarOut = false;

  public numDesignActive: number = 0;
  
  constructor(
    private activatedRoute: ActivatedRoute,
    public calculatorService: CalculatorService,
    public mixpanelService: MixpanelService) {} 

  ngOnInit() {
    
    window.addEventListener('keypress', (e) => {
      if (e.key === '*') {
        this.calculatorService.autoCalculateOutput = !this.calculatorService.autoCalculateOutput;
      }
    });

    this.activatedRoute.queryParams
    .subscribe(params => {
      //paramsの値はiframe内のパラメーターを取得してしまい期待する値を取得出来ない為
      //パラメーターの値はURLから直接取得しparamsの値は使用しない
      if (!this.initialized) {
        let search = top.location.search;
        let paramaters = {}; 
        search.slice(0).split('&').forEach( function(param) {
           let pair = param.split('='); 
           paramaters[pair[0]] = decodeURIComponent(pair[1] || ''); 
        });
        
        if( Object.keys(paramaters).length != 0 ){
          const hasParam = this.parseParams(paramaters);
          if (hasParam) {
            this.calculate(false);
          }
        }
        this.initialized = true;
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

    let hasParam: boolean = false;
    switch (measurementUnit) {
      case 'ft':
        this.calculatorService.measurementUnit = MeasurementUnits.Feet;
        hasParam = true;
        break;
      case 'm':
        this.calculatorService.measurementUnit = MeasurementUnits.Meters;
        hasParam = true;
        break;
    }

    if (ceilingHeight) {
      this.calculatorService.ceilingHeight = ceilingHeight;
      hasParam = true;
    }
    if (lectureWidth) {
      this.calculatorService.lectureWidth = lectureWidth;
      hasParam = true;
    }
    if (presenterHeight) {
      this.calculatorService.presenterHeight = presenterHeight;
      hasParam = true;
    }
    if (audienceHeight) {
      this.calculatorService.audienceHeight = audienceHeight;
      hasParam = true;
    }
    if (audienceDepth) {
      this.calculatorService.audienceDepth = audienceDepth;
      hasParam = true;
    }
    if (inputExtenderLength) {
      this.calculatorService.inputExtenderLength = inputExtenderLength;
      hasParam = true;
    }
    if (inputAudienceExtenderLength) {
      this.calculatorService.inputAudienceExtenderLength = inputAudienceExtenderLength;
      hasParam = true;
    }

    if (reinforcePresenter) {
      this.calculatorService.reinforcePresenter = !!(+reinforcePresenter);
      hasParam = true;
    }

    if (recordPresenter) {
      this.calculatorService.recordPresenter = !!(+recordPresenter);
      hasParam = true;
    }

    if (recordAudience) {
      this.calculatorService.recordAudience = !!(+recordAudience);
      hasParam = true;
    }

    switch (reinforcementPriority) {
      case 0:
      case '0':
        this.calculatorService.soundReinforcementPriority = SoundReinforcementPriority.AudioQuality;
        hasParam = true;
        break;
      case 1:
      case '1':
        this.calculatorService.soundReinforcementPriority = SoundReinforcementPriority.DetectionRange;
        hasParam = true;
        break;
    }

    return hasParam;
  }
}
