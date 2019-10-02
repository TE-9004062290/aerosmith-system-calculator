import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppComponent } from '@app/app.component';
import { AppRoutingModule } from '@app/app-routing.module';

import { CalculationTheatreComponent } from '@main/calculation-theatre/calculation-theatre.component';

import { CalculationInputsComponent } from '@components/calculation-inputs/calculation-inputs.component';
import { CalculationOutputsComponent } from '@components/calculation-outputs/calculation-outputs.component';
import { RadioToggleComponent } from './components/radio-toggle/radio-toggle.component';

@NgModule({
  declarations: [
    AppComponent,
    CalculationTheatreComponent,
    CalculationInputsComponent,
    CalculationOutputsComponent,
    RadioToggleComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
