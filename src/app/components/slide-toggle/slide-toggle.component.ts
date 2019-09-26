import { Component, OnInit, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

const noop = () => {
};

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SlideToggleComponent),
    multi: true
};

@Component({
  selector: 'app-slide-toggle',
  templateUrl: './slide-toggle.component.html',
  styleUrls: ['./slide-toggle.component.scss'],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class SlideToggleComponent implements ControlValueAccessor {

  @Input() leftOption: string = "left";
  @Input() rightOption: string = "right";
  @Input() defaultOption: string = this.leftOption;
  @Output() onToggle: EventEmitter<string> = new EventEmitter();
  
  private innerValue: string = this.defaultOption;
  private knobPosition: string = this.innerValue === this.leftOption ? "left" : "right";

  constructor() { }

  ngOnInit() {
  }

  private onTouchedCallback: () => void = noop;
  private onChangeCallback: (_: any) => void = noop;

  public toggle() {
    if (this.innerValue === this.leftOption) {
      this.innerValue = this.rightOption;
      this.knobPosition = "right";
    } else {
      this.innerValue = this.leftOption;
      this.knobPosition = "left";
    }

    this.onChangeCallback(this.innerValue);
  }

  writeValue(value: any): void {
    if (value !== this.innerValue && [this.leftOption, this.rightOption].includes(value)) {
      this.innerValue = value;
      this.knobPosition = this.innerValue === this.leftOption ? "left" : "right";
    }
  }
  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    throw new Error("Method not implemented.");
  }
}
