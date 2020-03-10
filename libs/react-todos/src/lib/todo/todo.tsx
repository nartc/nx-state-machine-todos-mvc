import { TodoWithRef } from '@nx-state-machine/machine';
import { useService } from '@xstate/react/lib';
import classNames from 'classnames';
import React, { ChangeEvent, KeyboardEvent, RefObject, useEffect, useRef } from 'react';

import './todo.css';

/* eslint-disable-next-line */
export interface TodoProps {
  todoRef: TodoWithRef['ref'];
}

export const Todo = ({ todoRef }: TodoProps) => {
  const [state, send] = useService(todoRef);
  const inputRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>;
  const { id, title, completed } = state.context;

  useEffect(() => {
    todoRef.execute(state, {
      focusInput() {
        inputRef.current?.select();
      },
    });
  }, [state, todoRef]);

  const onTodoToggleChanged = () => {
    send('TOGGLE_COMPLETE');
  };

  const onLabelDoubleClicked = () => {
    send('EDIT');
  };

  const onDestroyClicked = () => {
    send('DELETE');
  };

  const onEditInputBlurred = () => {
    send('BLUR');
  };
  const onEditInputChanged = (event: ChangeEvent<HTMLInputElement>) => {
    send('CHANGE', { value: event.target.value });
  };
  const onEditInputKeyPressed = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      send('COMMIT');
    }
  };
  const onEditInputKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      send('CANCEL');
    }
  };

  return (
    <li
      className={classNames({
        editing: state.matches('editing'),
        completed,
      })}
      key={id}
    >
      <div className="view">
        <input type="checkbox" className="toggle" onChange={onTodoToggleChanged} checked={completed} />
        <label onDoubleClick={onLabelDoubleClicked}>{title}</label>{' '}
        <button className="destroy" onClick={onDestroyClicked} />
      </div>
      <input
        type="text"
        className="edit"
        value={title}
        ref={inputRef}
        onBlur={onEditInputBlurred}
        onChange={onEditInputChanged}
        onKeyPress={onEditInputKeyPressed}
        onKeyDown={onEditInputKeyDown}
      />
    </li>
  );
};

export default Todo;
