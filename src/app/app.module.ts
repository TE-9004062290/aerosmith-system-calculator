import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialogModule } from "@angular/material/dialog";

import { AppComponent } from '@app/app.component';
import { AppRoutingModule } from '@app/app-routing.module';

import { CalculationTheatreComponent } from '@main/calculation-theatre/calculation-theatre.component';

import { CalculationInputsComponent } from '@components/calculation-inputs/calculation-inputs.component';
import { CalculationOutputsComponent } from '@components/calculation-outputs/calculation-outputs.component';
import { RadioToggleComponent } from './components/radio-toggle/radio-toggle.component';
import { SvgStandingPersonComponent } from './components/svg-standing-person/svg-standing-person.component';
import { GraphicalStageComponent } from './components/graphical-stage/graphical-stage.component';
import { SvgMicrophoneComponent } from './components/svg-microphone/svg-microphone.component';
import { MeasuringStickComponent } from './components/measuring-stick/measuring-stick.component';
import { SvgIconsComponent } from './components/svg-icons/svg-icons.component';
import { VersionStampComponent } from './components/version-stamp/version-stamp.component';
import { GraphicalStageTopComponent } from './components/graphical-stage-top/graphical-stage-top.component';
import { DesignInputsComponent } from './components/design-inputs/design-inputs.component';
import { SvgCaptureRadiusComponent } from './components/svg-capture-radius/svg-capture-radius.component';
import { GraphicalStageSideComponent } from './components/graphical-stage-side/graphical-stage-side.component';
import { RadiiLegendComponent } from './components/radii-legend/radii-legend.component';
import { VersionOutputComponent } from './components/version-output/version-output.component';
import { LicenseDialogComponent } from './components/license-dialog/license-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    CalculationTheatreComponent,
    CalculationInputsComponent,
    CalculationOutputsComponent,
    RadioToggleComponent,
    SvgStandingPersonComponent,
    GraphicalStageComponent,
    SvgMicrophoneComponent,
    MeasuringStickComponent,
    SvgIconsComponent,
    VersionStampComponent,
    GraphicalStageTopComponent,
    DesignInputsComponent,
    SvgCaptureRadiusComponent,
    GraphicalStageSideComponent,
    RadiiLegendComponent,
    VersionOutputComponent,
    LicenseDialogComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDialogModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
