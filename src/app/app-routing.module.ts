import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CalculationTheatreComponent } from '@main/calculation-theatre/calculation-theatre.component';


const routes: Routes = [
  {
    path: '**',
    component: CalculationTheatreComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
