import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThreeJSSampleListPageRoutingModule } from './three-jssample-list-routing.module';

import { ThreeJSSampleListPage } from './three-jssample-list.page';
import { Basic3Component } from './components/basic3/basic3.component';
import { LightsHemisphereComponent } from './components/lights-hemisphere/lights-hemisphere.component';
import { ClothSimulationComponent } from './components/cloth-simulation/cloth-simulation.component';
import { LittlestTokyoComponent } from './components/littlest-tokyo/littlest-tokyo.component';
import { SkeletalAnimationBlendingComponent } from './components/skeletal-animation-blending/skeletal-animation-blending.component';
import { AdditiveAnimationSkinningComponent } from './components/additive-animation-skinning/additive-animation-skinning.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ThreeJSSampleListPageRoutingModule
  ],
  declarations: [ThreeJSSampleListPage, Basic3Component,
    LightsHemisphereComponent,
    ClothSimulationComponent,
    LittlestTokyoComponent,
    SkeletalAnimationBlendingComponent,
    AdditiveAnimationSkinningComponent
  ]
})
export class ThreeJSSampleListPageModule {}
