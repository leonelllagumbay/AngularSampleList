import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThreeJSSampleListPageRoutingModule } from './three-jssample-list-routing.module';

import { ThreeJSSampleListPage } from './three-jssample-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ThreeJSSampleListPageRoutingModule
  ],
  declarations: [ThreeJSSampleListPage]
})
export class ThreeJSSampleListPageModule {}
