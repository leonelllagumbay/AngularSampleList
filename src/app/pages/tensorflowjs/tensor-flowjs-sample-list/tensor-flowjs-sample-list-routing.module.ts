import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TensorFlowjsSampleListPage } from './tensor-flowjs-sample-list.page';
import { OfflineChatBotComponent } from './components/offline-chat-bot/offline-chat-bot.component';
import { QuickSampleComponent } from './components/quick-sample/quick-sample.component';
import { DicomViewerComponent } from './components/dicom-viewer/dicom-viewer.component';

const routes: Routes = [
  {
    path: '',
    component: TensorFlowjsSampleListPage
  }, {
    path: 'offline-chat-bot',
    component: OfflineChatBotComponent
  }, {
    path: 'quick-sample',
    component: QuickSampleComponent
  }, {
    path: 'dicom-viewer',
    component: DicomViewerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TensorFlowjsSampleListPageRoutingModule {}
