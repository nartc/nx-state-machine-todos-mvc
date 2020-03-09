import { Todo } from '@nx-state-machine/data';
import { actions, Machine, StateSchema } from 'xstate';

const { assign, sendParent } = actions;

export interface TodoStateSchema extends StateSchema {
  states: {
    idle: {
      states: {
        unknown: {};
        pending: {};
        completed: {};
        hist: {};
      };
    };
    editing: {};
    deleted: {};
  };
}

export type TodoEvent =
  | { type: 'EDIT' }
  | { type: 'CHANGE'; value: string }
  | { type: 'COMMIT' }
  | { type: 'CANCEL' }
  | { type: 'BLUR' }
  | { type: 'SET_COMPLETE' }
  | { type: 'SET_ACTIVE' }
  | { type: 'TOGGLE_COMPLETE' }
  | { type: 'DELETE' };

export interface TodoContext extends Todo {
  prevTitle: string;
}

export const todoMachine = Machine<TodoContext, TodoStateSchema, TodoEvent>({
  id: 'todo',
  initial: 'idle',
  context: {
    completed: false,
    id: undefined,
    title: '',
    prevTitle: '',
  },
  on: {
    TOGGLE_COMPLETE: {
      target: '.idle.completed',
      actions: [
        assign<TodoContext>({ completed: true }),
        sendParent((ctx: TodoContext) => {
          const { prevTitle, ...todo } = ctx;
          return { type: 'TODO.COMMIT', todo };
        }),
      ],
    },
    DELETE: 'deleted',
  },
  states: {
    idle: {
      initial: 'unknown',
      states: {
        unknown: {
          on: {
            '': [{ target: 'completed', cond: ctx => ctx.completed }, { target: 'pending' }],
          },
        },
        pending: {
          on: {
            SET_COMPLETE: {
              target: 'completed',
              actions: [
                assign<TodoContext>({ completed: true }),
                sendParent((ctx: TodoContext) => {
                  const { prevTitle, ...todo } = ctx;
                  return { type: 'TODO.COMMIT', todo };
                }),
              ],
            },
          },
        },
        completed: {
          on: {
            TOGGLE_COMPLETE: {
              target: 'pending',
              actions: [
                assign<TodoContext>({ completed: false }),
                sendParent((ctx: TodoContext) => {
                  const { prevTitle, ...todo } = ctx;
                  return { type: 'TODO.COMMIT', todo };
                }),
              ],
            },
            SET_ACTIVE: {
              target: 'pending',
              actions: [
                assign<TodoContext>({ completed: false }),
                sendParent((ctx: TodoContext) => {
                  const { prevTitle, ...todo } = ctx;
                  return { type: 'TODO.COMMIT', todo };
                }),
              ],
            },
          },
        },
        hist: {
          type: 'history',
        },
      },
      on: {
        EDIT: {
          target: 'editing',
          actions: 'focusInput',
        },
      },
    },
    editing: {
      entry: assign({ prevTitle: ctx => ctx.title }),
      on: {
        CHANGE: {
          actions: assign({ title: (_, e) => e.value }),
        },
        COMMIT: [
          {
            target: 'idle.hist',
            actions: sendParent((ctx: TodoContext) => {
              const { prevTitle, ...todo } = ctx;
              return { type: 'TODO.COMMIT', todo };
            }),
            cond: ctx => ctx.title.trim().length > 0,
          },
          {
            target: 'deleted',
          },
        ],
        BLUR: {
          target: 'idle',
          actions: sendParent((ctx: TodoContext) => {
            const { prevTitle, ...todo } = ctx;
            return { type: 'TODO.COMMIT', todo };
          }),
        },
        CANCEL: {
          target: 'idle',
          actions: assign({ title: ctx => ctx.prevTitle }),
        },
      },
    },
    deleted: {
      entry: sendParent((ctx: TodoContext) => ({
        type: 'TODO.DELETE',
        id: ctx.id,
      })),
    },
  },
});
