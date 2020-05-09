import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { D3jsSampleListPageRoutingModule } from './d3js-sample-list-routing.module';

import { D3jsSampleListPage } from './d3js-sample-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    D3jsSampleListPageRoutingModule
  ],
  declarations: [D3jsSampleListPage]
})
export class D3jsSampleListPageModule {}
