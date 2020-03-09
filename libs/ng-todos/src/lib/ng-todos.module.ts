import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TodoComponent } from './todo/todo.component';
import { TodosComponent } from './todos/todos.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: '', component: TodosComponent, pathMatch: 'full' },
      { path: ':filter', component: TodosComponent },
    ]),
  ],
  declarations: [TodosComponent, TodoComponent],
})
export class NgTodosModule {}
