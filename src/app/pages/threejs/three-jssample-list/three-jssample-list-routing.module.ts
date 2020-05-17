import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ThreeJSSampleListPage } from './three-jssample-list.page';
import { Basic3Component } from './components/basic3/basic3.component';
import { LightsHemisphereComponent } from './components/lights-hemisphere/lights-hemisphere.component';
import { ClothSimulationComponent } from './components/cloth-simulation/cloth-simulation.component';
import { LittlestTokyoComponent } from './components/littlest-tokyo/littlest-tokyo.component';

const routes: Routes = [
  {
    path: '',
    component: ThreeJSSampleListPage
  }, {
    path: 'basic3',
    component: Basic3Component
  }, {
    path: 'lights-hemisphere',
    component: LightsHemisphereComponent
  }, {
    path: 'cloth-simulation',
    component: ClothSimulationComponent
  }, {
    path: 'littlest-tokyo',
    component: LittlestTokyoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThreeJSSampleListPageRoutingModule {}
