import { Injectable } from '@angular/core';
import { TodosContext, TodosEvent, todosMachine, TodosStateSchema, TodoWithRef } from '@nx-state-machine/machine';
import { LocalStorageService } from '@nx-state-machine/ng-common';
import { combineLatest, from, Observable } from 'rxjs';
import { map, pluck } from 'rxjs/operators';
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

  get rawStateContext(): TodosContext {
    return this._machineInterpreter.state.context;
  }

  get stateContext$(): Observable<TodosContext> {
    return this.state$.pipe(pluck('context'));
  }

  get todos$(): Observable<TodoWithRef[]> {
    return this.stateContext$.pipe(pluck('todos'));
  }

  get newTodo$(): Observable<string> {
    return this.stateContext$.pipe(pluck('newTodo'));
  }

  get isMatchAll$(): Observable<boolean> {
    return this.state$.pipe(map(state => state.matches('all')));
  }

  get isMatchActive$(): Observable<boolean> {
    return this.state$.pipe(map(state => state.matches('active')));
  }

  get isMatchCompleted$(): Observable<boolean> {
    return this.state$.pipe(map(state => state.matches('completed')));
  }

  get activeTodosCount$(): Observable<number> {
    return this.stateContext$.pipe(map(({ todos }) => todos.filter(todo => !todo.completed).length));
  }

  get isAllCompleted$(): Observable<boolean> {
    return combineLatest([this.todos$, this.activeTodosCount$]).pipe(
      map(([todos, activeCount]) => todos.length > 0 && activeCount === 0),
    );
  }

  get currentMark$(): Observable<string> {
    return this.isAllCompleted$.pipe(map(isAllCompleted => (!isAllCompleted ? 'completed' : 'active')));
  }

  get currentMarkEvent$(): Observable<TodosEvent['type']> {
    return this.currentMark$.pipe(map(mark => `MARK.${mark}` as TodosEvent['type']));
  }

  get filteredTodos$(): Observable<TodoWithRef[]> {
    return combineLatest([this.state$, this.todos$]).pipe(
      map(([state, todos]) => {
        if (state.matches('active')) {
          return todos.filter(todo => !todo.completed);
        }

        if (state.matches('completed')) {
          return todos.filter(todo => todo.completed);
        }

        return todos;
      }),
    );
  }
}
