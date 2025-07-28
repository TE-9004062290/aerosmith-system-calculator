import { Component, OnInit, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

const noop = () => {
};

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => RadioToggleComponent),
    multi: true
};
@Component({
    selector: 'app-radio-toggle',
    templateUrl: './radio-toggle.component.html',
    styleUrls: ['./radio-toggle.component.scss'],
    providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR],
    standalone: false
})
export class RadioToggleComponent implements ControlValueAccessor {

  private _toggleLabel: string = "Select Option";
  get toggleLabel() { return this._toggleLabel; }
  @Input() set toggleLabel(val: string) {
    this._toggleLabel = val;
    this.toggleName = this.normalizeRadioName(val);
  }
  @Input() leftOption: string = "left";
  @Input() leftLabel: string = "left";
  @Input() rightOption: string = "right";
  @Input() rightLabel: string = "right";
  @Input() defaultOption: string = this.leftOption;
  @Output() onToggle: EventEmitter<string> = new EventEmitter();
  
  private innerValue: string = this.defaultOption;
  public toggleName: string = '';
  public selectedOption: string = this.innerValue === this.leftOption ? "left" : "right";

  constructor() { }

  ngOnInit() {
    this.toggleName = this.normalizeRadioName(this.toggleLabel);
  }

  private onTouchedCallback: () => void = noop;
  private onChangeCallback: (_: any) => void = noop;

  public toggle() {
    if (this.innerValue === this.leftOption) {
      this.innerValue = this.rightOption;
      this.selectedOption = "right";
    } else {
      this.innerValue = this.leftOption;
      this.selectedOption = "left";
    }

    this.onChangeCallback(this.innerValue);
  }

  writeValue(value: any): void {
    if (value !== this.innerValue && [this.leftOption, this.rightOption].includes(value)) {
      this.innerValue = value;
      this.selectedOption = this.innerValue === this.leftOption ? "left" : "right";
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

  private normalizeRadioName(name: string) {
    return name.replace(/\s+/g, '-').toLowerCase();
  }
}
