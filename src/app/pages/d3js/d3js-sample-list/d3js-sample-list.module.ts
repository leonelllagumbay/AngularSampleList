import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { D3jsSampleListPageRoutingModule } from './d3js-sample-list-routing.module';

import { D3jsSampleListPage } from './d3js-sample-list.page';
import { BasicChartComponent } from './components/basic-chart/basic-chart.component';
import { HttpClientModule } from '@angular/common/http';
import { CumsumComponent } from './components/cumsum/cumsum.component';
import { BarChartRaceComponent } from './components/bar-chart-race/bar-chart-race.component';
import { VersorDraggingMapComponent } from './components/versor-dragging-map/versor-dragging-map.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule,
    D3jsSampleListPageRoutingModule
  ],
  declarations: [D3jsSampleListPage, BasicChartComponent, CumsumComponent,
    BarChartRaceComponent,
    VersorDraggingMapComponent
  ]
})
export class D3jsSampleListPageModule {}
