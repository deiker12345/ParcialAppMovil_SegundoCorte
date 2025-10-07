import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SharedPage } from './shared.page';

const routes: Routes = [
  {
    path: '',
    component: SharedPage
  },  {
    path: 'guard',
    loadChildren: () => import('./guard/guard.module').then( m => m.GuardPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SharedPageRoutingModule {}
