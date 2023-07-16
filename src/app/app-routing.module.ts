import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PianoComponent } from './components/piano/piano.component';

const routes: Routes = [
  {
    path: '', redirectTo: 'piano', pathMatch: 'full'
  },
  {
    path: 'piano', component: PianoComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
