import { CalculatorService } from '../services/calculator.service';

type NumericKeys<T> = Extract<{
  [K in keyof T]-?: T[K] extends number ? K : never
}[keyof T], string>;

export type CalculatorInputField = Extract<NumericKeys<CalculatorService>, `input${string}`>;
export type CalculatorInputService = CalculatorService & Record<CalculatorInputField, number>;