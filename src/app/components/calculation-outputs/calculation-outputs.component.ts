import { Component, OnInit } from '@angular/core';

import { CalculatorService } from '@app/services/calculator.service';
import { ClipboardService } from '@app/services/clipboard.service';

@Component({
  selector: 'app-calculation-outputs',
  templateUrl: './calculation-outputs.component.html',
  styleUrls: ['./calculation-outputs.component.scss']
})
export class CalculationOutputsComponent implements OnInit {

  constructor(
    private clipboardService: ClipboardService,
    public calculatorService: CalculatorService
  ) { }

  public printOutput() {
    window.print();
    return false;
  }

  public shareOutput() {
    this.clipboardService.copyToClipboard(this.calculatorService.serializeToUrl());
  }

  ngOnInit() {
  }

}
