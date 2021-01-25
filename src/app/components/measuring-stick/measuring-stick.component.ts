import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { CalculatorService } from '@app/services/calculator.service';

@Component({
  selector: 'app-measuring-stick',
  templateUrl: './measuring-stick.component.html',
  styleUrls: ['./measuring-stick.component.scss']
})
export class MeasuringStickComponent implements OnInit {

  constructor(public calculatorService: CalculatorService) { }

  @Input() public orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Input() public step = 1;
  
  private _width: number = 0;
  get width(): number {
    return this._width;
  }
  @Input() set width(value: number) {
    if (!value || isNaN(value)) {
      return;
    }
    this._width = value;
    if (this._width < this.ultraThinThreshold) {
      this.mode = 'ultrathin';
    } else if (this._width < this.thinThreshold) {
      this.mode = 'thin';
    } else {
      this.mode = 'wide';
    }
  }

  private _height: number = 0;
  get height(): number {
    return this._height;
  }
  @Input() set height(value: number) {
    if (!value || isNaN(value)) {
      return;
    }

    this._height = value;
    if (this._height < this.ultraShortThreshold) {
      this.mode = 'ultrathin';
    } else if (this._height < this.shortThreshold) {
      this.mode = 'thin';
    } else {
      this.mode = 'wide';
    }
  }

  private _forcedMode: 'thin' | 'wide' = 'wide';
  private _modeIsForced = false;
  get forcedMode(): 'thin' | 'wide' {
    return this._forcedMode;
  }
  @Input() set forcedMode(value: 'thin' | 'wide') {
    this.mode = value;
    this._forcedMode = value;
    this._modeIsForced = true;
  }

  @Input() public twinned: boolean = false; /* I realize this is a hack, fight me */
  @Input() public maxWidth: string = undefined;
  @Input() public thinModeDirection: 'top' | 'right' | 'down' | 'left' = 'top';
  @Input() public isInput: boolean = false;
  @Input() public inputMin: number = 0;
  @Input() public inputMax: number = 100;
  @Input() public inputValue: number = 0;
  
  @Output() public updated: EventEmitter<any> = new EventEmitter();

  public mode: 'wide' | 'thin' | 'ultrathin' = 'wide';
  private thinThreshold = 100; // px
  private ultraThinThreshold = 25;
  private shortThreshold = 60;
  private ultraShortThreshold = 25;

  public firstContext = { first: true };
  public secondContext = { first: false };

  ngOnInit() {
    if (this._width) {
      if (this._width < this.ultraThinThreshold) {
        this.mode = 'ultrathin';
      } else if (this._width < this.thinThreshold) {
        this.mode = 'thin';
      } else {
        this.mode = 'wide';
      }
    }

    if (this._height) {
      if (this._height < this.ultraShortThreshold) {
        this.mode = 'ultrathin';
      } else if (this._height < this.shortThreshold) {
        this.mode = 'thin';
      } else {
        this.mode = 'wide';
      }
    }

    if (this._modeIsForced) {
      this.mode = this._forcedMode;
    }
  }

  onInputChange(inputElement) {
    this.updated.emit(inputElement);
  }

}
