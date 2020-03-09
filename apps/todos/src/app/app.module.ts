import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('@nx-state-machine/ng-todos').then(m => m.NgTodosModule)
      }
    ]
  }
];

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, RouterModule.forRoot(routes, { useHash: true })],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
