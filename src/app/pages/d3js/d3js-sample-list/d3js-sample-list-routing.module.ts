import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { D3jsSampleListPage } from './d3js-sample-list.page';

const routes: Routes = [
  {
    path: '',
    component: D3jsSampleListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class D3jsSampleListPageRoutingModule {}
