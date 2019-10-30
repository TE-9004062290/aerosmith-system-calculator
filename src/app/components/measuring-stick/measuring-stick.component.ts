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
  @Input() public width: number = 0;
  @Input() public height: number = 0;

  @Input() public isInput: boolean = false;
  @Input() public inputMin: number = 0;
  @Input() public inputMax: number = 100;
  @Input() public inputValue: number = 0;
  
  @Output() public updated: EventEmitter<any> = new EventEmitter();

  ngOnInit() {
  }

  onInputChange(inputElement) {
    this.updated.emit(inputElement);
  }

}
