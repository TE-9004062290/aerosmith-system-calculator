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
  
  private _width: number = 0;
  get width(): number {
    return this._width;
  }
  @Input() set width(value: number) {
    this._width = value;
    if (this._width && this._width < this.thinThreshold) {
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
    this._height = value;
    if (this._height && this._height < this.shortThreshold) {
      this.mode = 'thin';
    } else {
      this.mode = 'wide';
    }
  }

  @Input() public thinModeDirection: 'top' | 'right' | 'down' | 'left' = 'top';
  @Input() public isInput: boolean = false;
  @Input() public inputMin: number = 0;
  @Input() public inputMax: number = 100;
  @Input() public inputValue: number = 0;
  
  @Output() public updated: EventEmitter<any> = new EventEmitter();

  public mode: 'wide' | 'thin' = 'wide';
  private thinThreshold = 150; // 150px
  private shortThreshold = 60;

  ngOnInit() {
    if ((this._width && this._width < this.thinThreshold) || (this._height && this._height < this.shortThreshold)) {
      this.mode = 'thin';
    } else {
      this.mode = 'wide';
    }
  }

  onInputChange(inputElement) {
    this.updated.emit(inputElement);
  }

}
