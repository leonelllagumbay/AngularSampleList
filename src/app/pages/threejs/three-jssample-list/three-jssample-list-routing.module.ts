import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ThreeJSSampleListPage } from './three-jssample-list.page';

const routes: Routes = [
  {
    path: '',
    component: ThreeJSSampleListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThreeJSSampleListPageRoutingModule {}
