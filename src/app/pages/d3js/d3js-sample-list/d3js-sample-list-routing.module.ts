import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { D3jsSampleListPage } from './d3js-sample-list.page';
import { BasicChartComponent } from './components/basic-chart/basic-chart.component';

const routes: Routes = [
  {
    path: '',
    component: D3jsSampleListPage
  }, {
    path: 'basic-chart',
    component: BasicChartComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class D3jsSampleListPageRoutingModule {}
