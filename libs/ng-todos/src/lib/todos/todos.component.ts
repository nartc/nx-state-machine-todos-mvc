import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TodosContext, TodosEvent, TodoWithRef } from '@nx-state-machine/machine';
import { combineLatest, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
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

function toVm([
  context,
  isMatchAll,
  isMatchActive,
  isMatchCompleted,
  activeTodoCount,
  isAllCompleted,
  currentMark,
  currentMarkEvent,
  filteredTodos,
]: [TodosContext, boolean, boolean, boolean, number, boolean, string, TodosEvent['type'], TodoWithRef[]]): TodosVm {
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

    this.vm$ = combineLatest([
      this._todosMachineService.stateContext$,
      this._todosMachineService.isMatchAll$,
      this._todosMachineService.isMatchActive$,
      this._todosMachineService.isMatchCompleted$,
      this._todosMachineService.activeTodosCount$,
      this._todosMachineService.isAllCompleted$,
      this._todosMachineService.currentMark$,
      this._todosMachineService.currentMarkEvent$,
      this._todosMachineService.filteredTodos$,
    ]).pipe(map(toVm));
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
