import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)},
  {
    path: 'three-jssample-list',
    loadChildren: () => import('./pages/threejs/three-jssample-list/three-jssample-list.module').then( m => m.ThreeJSSampleListPageModule)
  },
  {
    path: 'd3js-sample-list',
    loadChildren: () => import('./pages/d3js/d3js-sample-list/d3js-sample-list.module').then( m => m.D3jsSampleListPageModule)
  },
  {
    path: 'tensor-flowjs-sample-list',
    loadChildren: () => {
      return import('./pages/tensorflowjs/tensor-flowjs-sample-list/tensor-flowjs-sample-list.module')
        .then( m => m.TensorFlowjsSampleListPageModule);
    }
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
