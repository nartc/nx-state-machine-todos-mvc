import { Injectable } from '@angular/core';
import { TodosContext, TodosEvent, todosMachine, TodosStateSchema, TodoWithRef } from '@nx-state-machine/machine';
import { LocalStorageService } from '@nx-state-machine/ng-common';
import { from, Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';
import { EventData, interpret, Interpreter, State, StateNode } from 'xstate';

@Injectable({ providedIn: 'root' })
export class TodosMachineService {
  private readonly _persistedMachine: StateNode<TodosContext, TodosStateSchema, TodosEvent>;
  private readonly _machineInterpreter: Interpreter<TodosContext, TodosStateSchema, TodosEvent>;

  constructor(private readonly _storageService: LocalStorageService) {
    this._persistedMachine = todosMachine.withConfig(
      {
        actions: {
          persist: context => {
            this._storageService.setObject('todos-xstate', context.todos);
          },
        },
      },
      {
        newTodo: '',
        todos: (() => {
          try {
            return this._storageService.getValue<TodoWithRef[]>('todos-xstate') || [];
          } catch (e) {
            return [];
          }
        })(),
      },
    );

    this._machineInterpreter = interpret<TodosContext, TodosStateSchema, TodosEvent>(this._persistedMachine).start();
  }

  sendEvent(event: TodosEvent['type'], data?: EventData) {
    this._machineInterpreter.send(event, data);
  }

  get state$(): Observable<State<TodosContext, TodosEvent, TodosStateSchema>> {
    return from(this._machineInterpreter);
  }

  get stateContext$(): Observable<TodosContext> {
    return this.state$.pipe(pluck('context'));
  }
}
