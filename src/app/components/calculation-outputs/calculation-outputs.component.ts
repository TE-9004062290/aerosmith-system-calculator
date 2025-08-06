import { Component, OnInit } from '@angular/core';

import { CalculatorService } from '@app/services/calculator.service';
import { ClipboardService } from '@app/services/clipboard.service';

@Component({
    selector: 'app-calculation-outputs',
    templateUrl: './calculation-outputs.component.html',
    styleUrls: ['./calculation-outputs.component.scss'],
    standalone: false
})
export class CalculationOutputsComponent implements OnInit {

  constructor(
    private clipboardService: ClipboardService,
    public calculatorService: CalculatorService
  ) { }

  public printOutput() {
    this.calculatorService.$refreshBeforePrint.next(true);
    setTimeout(() => {
      window.print();
      this.calculatorService.$refreshAfterPrint.next(true);
    }, 50);
    return false;
  }

  public shareOutput() {
    this.clipboardService.copyToClipboard(this.calculatorService.serializeToUrl());
  }

  ngOnInit() {
  }

}
