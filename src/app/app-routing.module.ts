import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CalculationTheatreComponent } from '@main/calculation-theatre/calculation-theatre.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: '/calculator',
    pathMatch: 'full'
  },
  {
    path: 'calculator',
    component: CalculationTheatreComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
