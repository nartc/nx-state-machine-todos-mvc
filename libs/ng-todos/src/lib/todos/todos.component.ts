import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TodosContext, TodosEvent, TodosStateSchema, TodoWithRef } from '@nx-state-machine/machine';
import { combineLatest, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { State } from 'xstate';
import { TodosMachineService } from '../services/todos-machine.service';

interface TodosVm {
  context: TodosContext;
  isMatchAll: boolean;
  isMatchActive: boolean;
  isMatchCompleted: boolean;
  activeTodoCount: number;
  isAllCompleted: boolean;
  currentMark: string;
  currentMarkEvent: TodosEvent['type'];
  filteredTodos: TodoWithRef[];
}

function toVm([state, context]: [State<TodosContext, TodosEvent, TodosStateSchema>, TodosContext]): TodosVm {
  const isMatchAll = state.matches('all');
  const isMatchActive = state.matches('active');
  const isMatchCompleted = state.matches('completed');
  const activeTodoCount = context.todos.filter(todo => !todo.completed).length;
  const isAllCompleted = context.todos.length > 0 && activeTodoCount === 0;
  const currentMark = isAllCompleted ? 'active' : 'completed';
  const currentMarkEvent = `MARK.${currentMark}` as TodosEvent['type'];
  let filteredTodos = context.todos;

  if (state.matches('active')) {
    filteredTodos = context.todos.filter(todo => !todo.completed);
  } else if (state.matches('completed')) {
    filteredTodos = context.todos.filter(todo => todo.completed);
  }

  return {
    context,
    isMatchAll,
    isMatchActive,
    isMatchCompleted,
    activeTodoCount,
    currentMark,
    currentMarkEvent,
    filteredTodos,
    isAllCompleted,
  };
}

@Component({
  selector: 'nx-state-machine-todos',
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodosComponent implements OnInit {
  @ViewChild('todoInput') set todoInput(value: ElementRef<HTMLInputElement>) {
    if (value) {
      value.nativeElement.focus();
    }
  }

  vm$: Observable<TodosVm>;

  private destroy$ = new Subject<null>();

  constructor(private readonly _todosMachineService: TodosMachineService, private readonly _route: ActivatedRoute) {}

  ngOnInit(): void {
    this._route.url
      .pipe(
        map(segments => {
          if (!segments.length) {
            return 'all';
          }

          return segments[0].path;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(path => {
        this._todosMachineService.sendEvent(`SHOW.${path}` as TodosEvent['type']);
      });

    this.vm$ = combineLatest([this._todosMachineService.state$, this._todosMachineService.stateContext$]).pipe(
      map(toVm),
    );
  }

  onNewTodoEntered() {
    this._todosMachineService.sendEvent('NEWTODO.COMMIT');
  }

  onNewTodoChanged(value: string) {
    this._todosMachineService.sendEvent('NEWTODO.CHANGE', { value });
  }

  onToggleAll(currentMarkEvent: TodosEvent['type']) {
    this._todosMachineService.sendEvent(currentMarkEvent);
  }

  onClearCompletedClicked() {
    this._todosMachineService.sendEvent('CLEAR_COMPLETED');
  }

  todosTrackByFn(index: number, item: TodoWithRef) {
    return item.id;
  }
}
