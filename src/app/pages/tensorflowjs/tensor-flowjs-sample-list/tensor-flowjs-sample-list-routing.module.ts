import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TensorFlowjsSampleListPage } from './tensor-flowjs-sample-list.page';
import { OfflineChatBotComponent } from './components/offline-chat-bot/offline-chat-bot.component';

const routes: Routes = [
  {
    path: '',
    component: TensorFlowjsSampleListPage
  }, {
    path: 'offline-chat-bot',
    component: OfflineChatBotComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TensorFlowjsSampleListPageRoutingModule {}
