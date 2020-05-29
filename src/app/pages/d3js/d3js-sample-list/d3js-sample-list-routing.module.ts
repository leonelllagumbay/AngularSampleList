import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { D3jsSampleListPage } from './d3js-sample-list.page';
import { BasicChartComponent } from './components/basic-chart/basic-chart.component';
import { CumsumComponent } from './components/cumsum/cumsum.component';
import { BarChartRaceComponent } from './components/bar-chart-race/bar-chart-race.component';
import { VersorDraggingMapComponent } from './components/versor-dragging-map/versor-dragging-map.component';

const routes: Routes = [
  {
    path: '',
    component: D3jsSampleListPage
  }, {
    path: 'basic-chart',
    component: BasicChartComponent
  }, {
    path: 'cumsum',
    component: CumsumComponent
  }, {
    path: 'bar-chart-race',
    component: BarChartRaceComponent
  }, {
    path: 'versor-dragging-map',
    component: VersorDraggingMapComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class D3jsSampleListPageRoutingModule {}
