import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TodoContext, TodoEvent, TodoStateSchema, TodoWithRef } from '@nx-state-machine/machine';
import { combineLatest, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { State } from 'xstate';
import { TodoMachineService } from '../services/todo-machine.service';

interface TodoVm {
  context: TodoContext;
  isMatchEditing: boolean;
}

function toVm([state, context]: [State<TodoContext, TodoEvent, TodoStateSchema>, TodoContext]): TodoVm {
  const isMatchEditing = state.matches('editing');
  return { context, isMatchEditing };
}

@Component({
  selector: 'nx-state-machine-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TodoMachineService],
})
export class TodoComponent implements OnInit, OnDestroy {
  @ViewChild('editInput') set editInput(value: ElementRef<HTMLInputElement>) {
    if (!value) {
      return;
    }

    this._editInput = value;
  }

  private _editInput: ElementRef<HTMLInputElement>;
  @Input() todoRef: TodoWithRef['ref'];

  vm$: Observable<TodoVm>;
  private destroy$ = new Subject<null>();

  constructor(private readonly _todoMachineService: TodoMachineService, private readonly _cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this._todoMachineService.interpret(this.todoRef);
    this.vm$ = combineLatest([this._todoMachineService.state$, this._todoMachineService.stateContext$]).pipe(map(toVm));

    this._todoMachineService.state$.pipe(takeUntil(this.destroy$)).subscribe(state => {
      if (state.changed !== false && state.matches('editing')) {
        this._todoMachineService.execute(state, {
          focusInput: () => {
            requestAnimationFrame(() => this._editInput.nativeElement.select());
          },
        });
      }
    });
  }

  onToggled() {
    this._todoMachineService.sendEvent('TOGGLE_COMPLETE');
  }

  onLabelDoubleClicked() {
    this._todoMachineService.sendEvent('EDIT');
  }

  onDestroyClicked() {
    this._todoMachineService.sendEvent('DELETE');
  }

  onEditBlurred() {
    this._todoMachineService.sendEvent('BLUR');
  }

  onEditChanged(value: string) {
    this._todoMachineService.sendEvent('CHANGE', { value });
  }

  onEditEntered() {
    this._todoMachineService.sendEvent('COMMIT');
  }

  onEditEscaped() {
    this._todoMachineService.sendEvent('CANCEL');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
