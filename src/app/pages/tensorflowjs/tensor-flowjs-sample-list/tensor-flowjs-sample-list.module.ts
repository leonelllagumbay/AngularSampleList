import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TensorFlowjsSampleListPageRoutingModule } from './tensor-flowjs-sample-list-routing.module';

import { TensorFlowjsSampleListPage } from './tensor-flowjs-sample-list.page';
import { OfflineChatBotComponent } from './components/offline-chat-bot/offline-chat-bot.component';
import { QuickSampleComponent } from './components/quick-sample/quick-sample.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule,
    FormsModule,
    TensorFlowjsSampleListPageRoutingModule
  ],
  declarations: [TensorFlowjsSampleListPage, OfflineChatBotComponent, QuickSampleComponent]
})
export class TensorFlowjsSampleListPageModule {}
