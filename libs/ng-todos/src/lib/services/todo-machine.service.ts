import { Injectable } from '@angular/core';
import { TodoContext, TodoEvent, TodoStateSchema, TodoWithRef } from '@nx-state-machine/machine';
import { from, Observable } from 'rxjs';
import { map, pluck } from 'rxjs/operators';
import { EventData, MachineOptions, State } from 'xstate';

@Injectable()
export class TodoMachineService {
  private _machineInterpreter: TodoWithRef['ref'];

  constructor() {
  }

  interpret(todoRef: TodoWithRef['ref']) {
    if (!this._machineInterpreter) {
      this._machineInterpreter = todoRef;
    }
  }

  execute(
    currentState: State<TodoContext, TodoEvent>,
    actionsConfig: MachineOptions<TodoContext, TodoEvent>['actions']
  ) {
    this._machineInterpreter?.execute(currentState, actionsConfig);
  }

  sendEvent(event: TodoEvent['type'], data?: EventData) {
    this._machineInterpreter.send(event, data);
  }

  get state$(): Observable<State<TodoContext, TodoEvent, TodoStateSchema>> {
    return from(this._machineInterpreter);
  }

  get stateContext$(): Observable<TodoContext> {
    return this.state$.pipe(pluck('context'));
  }

  get isMatchEditing$(): Observable<boolean> {
    return this.state$.pipe(map(state => state.matches('editing')));
  }
}
