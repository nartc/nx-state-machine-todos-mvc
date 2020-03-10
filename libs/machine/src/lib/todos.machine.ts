import { Todo } from '@nx-state-machine/data';
import { assign, Interpreter, Machine, spawn, StateSchema } from 'xstate';
import { TodoContext, TodoEvent, todoMachine, TodoStateSchema } from './todo.machine';

const createTodo = (title: string) => {
  return new Todo(title);
};

export interface TodosStateSchema extends StateSchema {
  states: {
    initializing: {};
    all: {};
    active: {};
    completed: {};
  };
}

export type TodosEvent =
  | { type: 'NEWTODO.CHANGE'; value: string }
  | { type: 'NEWTODO.COMMIT' }
  | { type: 'TODO.COMMIT'; todo: Todo }
  | { type: 'TODO.DELETE'; id: number }
  | { type: 'SHOW.all' }
  | { type: 'SHOW.active' }
  | { type: 'SHOW.completed' }
  | { type: 'MARK.completed' }
  | { type: 'MARK.active' }
  | { type: 'CLEAR_COMPLETED' };

export interface TodoWithRef extends Todo {
  ref: Interpreter<TodoContext, TodoStateSchema, TodoEvent>;
}

export interface TodosContext {
  newTodo: string;
  todos: TodoWithRef[];
}

export const todosMachine = Machine<TodosContext, TodosStateSchema, TodosEvent>({
  id: 'todos',
  initial: 'initializing',
  context: {
    newTodo: '',
    todos: [],
  },
  states: {
    initializing: {
      entry: assign({
        todos: ctx =>
          ctx.todos.map(todo => ({
            ...todo,
            ref: spawn<TodoContext, TodoEvent>(todoMachine.withContext({ ...todo, prevTitle: todo.title })),
          })),
      }),
      on: {
        '': 'all',
      },
    },
    all: {},
    active: {},
    completed: {},
  },
  on: {
    'NEWTODO.CHANGE': {
      actions: assign({ newTodo: (_, event) => event.value }),
    },
    'NEWTODO.COMMIT': {
      actions: [
        assign({
          newTodo: '',
          todos: (ctx: TodosContext) => {
            const { newTodo } = ctx;
            const todo = createTodo(newTodo.trim());
            return ctx.todos.concat({
              ...todo,
              ref: spawn<TodoContext, TodoEvent>(todoMachine.withContext({ ...todo, prevTitle: todo.title })),
            });
          },
        }),
        'persist',
      ],
      cond: ctx => ctx.newTodo.trim().length > 0,
    },
    'TODO.COMMIT': {
      actions: [
        assign({
          todos: (ctx, event) =>
            ctx.todos.map(todo =>
              todo.id === event.todo.id
                ? {
                    ...todo,
                    ...event.todo,
                    ref: todo.ref,
                  }
                : todo,
            ),
        }),
        'persist',
      ],
    },
    'TODO.DELETE': {
      actions: [
        assign({
          todos: (ctx, event) => ctx.todos.filter(todo => todo.id !== event.id),
        }),
        'persist',
      ],
    },
    'SHOW.all': '.all',
    'SHOW.active': '.active',
    'SHOW.completed': '.completed',
    'MARK.completed': {
      actions: ctx => ctx.todos.forEach(todo => todo.ref.send('SET_COMPLETE')),
    },
    'MARK.active': {
      actions: ctx => ctx.todos.forEach(todo => todo.ref.send('SET_ACTIVE')),
    },
    CLEAR_COMPLETED: {
      actions: assign({
        todos: ctx => ctx.todos.filter(todo => !todo.completed),
      }),
    },
  },
});
