import { TodosContext, TodosEvent, todosMachine } from '@nx-state-machine/machine';
import { useHashChange } from '@nx-state-machine/react-common';
import { useMachine } from '@xstate/react';
import classNames from 'classnames';
import React, { ChangeEvent, KeyboardEvent, useEffect } from 'react';
import Todo from './todo/todo';

const persistedTodosMachine = todosMachine.withConfig(
  {
    actions: {
      persist: context => {
        localStorage.setItem('todos-xstate-react', JSON.stringify(context.todos));
      },
    },
  },
  {
    newTodo: '',
    todos: (() => {
      try {
        return JSON.parse(localStorage.getItem('todos-xstate-react')) || [];
      } catch (e) {
        return [];
      }
    })(),
  },
);

export const ReactTodos = () => {
  const [state, send] = useMachine<TodosContext, TodosEvent>(persistedTodosMachine);

  useHashChange(({ newURL }) => {
    const currentFilter = newURL.split('#/').pop() || 'all';
    localStorage.setItem('todos-xstate-filter-react', currentFilter);
    send(`SHOW.${currentFilter}` as TodosEvent['type']);
  });

  useEffect(() => {
    send(`SHOW.${localStorage.getItem('todos-xstate-filter-react') || 'all'}` as TodosEvent['type']);
  });

  const { todos, newTodo } = state.context;

  const activeTodosCount = todos.filter(todo => !todo.completed).length;
  const isAllCompleted = todos.length > 0 && activeTodosCount === 0;
  const currentMark = !isAllCompleted ? 'completed' : 'active';
  const currentMarkEvent = `MARK.${currentMark}` as TodosEvent['type'];

  let filterTodos = todos;

  if (state.matches('active')) {
    filterTodos = todos.filter(todo => !todo.completed);
  } else if ((state as any).matches('completed')) {
    filterTodos = todos.filter(todo => todo.completed);
  }

  const onNewTodoKeyPressed = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      send('NEWTODO.COMMIT');
    }
  };

  const onNewTodoChanged = (event: ChangeEvent<HTMLInputElement>) => {
    send('NEWTODO.CHANGE', { value: event.target.value });
  };

  const onToggleAll = () => {
    send(currentMarkEvent);
  };

  const onClearCompletedClicked = () => {
    send('CLEAR_COMPLETED');
  };

  return (
    <section className="todoapp">
      <header className="header">
        <h1>todos</h1>
        <input
          type="text"
          className="new-todo"
          placeholder={'What needs to be done?'}
          autoFocus
          onKeyPress={onNewTodoKeyPressed}
          onChange={onNewTodoChanged}
          value={newTodo}
        />
      </header>
      <section className="main">
        <input type="checkbox" className="toggle-all" id="toggle-all" checked={isAllCompleted} onChange={onToggleAll} />
        <label htmlFor="toggle-all" title={`Mark all as ${currentMark}`}>
          Mark all as {currentMark}
        </label>
        <ul className="todo-list">
          {filterTodos.map(todo => (
            <Todo key={todo.id} todoRef={todo.ref} />
          ))}
        </ul>
      </section>
      {!!todos.length && (
        <footer className="footer">
          <span className="todo-count">
            <strong>{activeTodosCount}</strong> item{activeTodosCount === 1 ? '' : 's'} left
          </span>
          <ul className="filters">
            <li>
              <a href="#/" className={classNames({ selected: state.matches('all') })}>
                All
              </a>
            </li>
            <li>
              <a href="#/active" className={classNames({ selected: state.matches('active') })}>
                Active
              </a>
            </li>
            <li>
              <a href="#/completed" className={classNames({ selected: state.matches('completed') })}>
                Completed
              </a>
            </li>
          </ul>
          {activeTodosCount < todos.length && (
            <button className="clear-completed" onClick={onClearCompletedClicked}>
              Clear Completed
            </button>
          )}
        </footer>
      )}
    </section>
  );
};

export default ReactTodos;
