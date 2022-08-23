import { createMachine, assign, sendParent, ActorRef } from "xstate";
import type { Typegen0 } from "./todoMachine.typegen";
import type { TodosEvent } from "./todosMachine";

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

export type TodoActor = Todo & {
  ref: ActorRef<TodoEvent>;
};

export type TodoContext = Todo & {
  prevTitle: string;
};

type ChangeEvent = { type: "CHANGE"; value: string };

export type TodoEvent =
  | ChangeEvent
  | { type: Typegen0["eventsCausingActions"]["commit"] };

export const createTodoMachine = ({ id, title, completed }: Todo) =>
  /** @xstate-layout N4IgpgJg5mDOIC5QBcD2FUDoBOYCGEAlgHZQDEAygKIAqA+gMIDyAsgAoAytVAIoqAAdUsQskKpi-EAA9EAWgCMAFgBsCzCoAMAJgXaVAdgCcBgKwrtAZgA0IAJ7zjlzEu2nXlzZcsAOPaYBfANs0DBx8IlIyGiYAcViuRlZObikhETEJKVkERRV3THcDJR8lTXMlAx8jWwdco29C011NVQMvP0DgkFCsXAIScmp6AEEGGgBJADUqNOFRcUkkGXkFAzMNY00qtSMFBoNa1fKVTG127VbyzSNTA0sgkPQ+iMGyKiJkOYzF7PltJRGHyYDoqW46NZmGz2Y53TC+AwKbblQGWUxdJ5hSALKIMAASIwAcrFZst0gsssscnIASZ4aYjJcbgpfEolEdcu11D52j4VL4jPzdBies9MNixLjWCwJjRvhSlqBqbptEZ4ds7toeSpKpZ2TDOUpTC5VXclJYFPy+QZHqKsZ83gAhDgAVQASvLMoqVrldNUNJYAWiyjy3BzFF4DJgfDzNBY7spETbur1xQ7cUSGFQOJ7flT-t41RbqmodVVLIZw0i4Qike13A1TA8U89onEElQkuwuDRSYJ5l6-r62ZoXHWGT5WoLTFWlGtMIztLpXD43HPk5jUGQeNnUmSB3mlasAaOwYGqjzJwpLeGzGrXO5gzG3Dygt1iOg4FJU-1IlBc5SR65PsOrRsUSK3G4Og6FWCimKOFqaEhniVOilq2qmEqDAB3rKpczj6CoRE+GiWyWIcBpyDySggusJFAoK+R8hhYoQGAAA2YDIJAOFDoo7jaCClp6u0mjKORM6UWWJqCnoOhGOaaIsRgvH5r6zSCaC4K6OsTZVlYNGeEYxnGZopRIkob4BEAA */
  createMachine(
    {
      context: { id, title, prevTitle: title, completed },
      tsTypes: {} as import("./todoMachine.typegen").Typegen0,
      id: "todo",
      initial: "reading",
      on: {
        TOGGLE_COMPLETE: {
          actions: [
            assign<TodoContext>({ completed: true }),
            sendParent<TodoContext, TodosEvent>((ctx) => {
              return {
                type: "todo_commit",
                todo: ctx,
              } as TodosEvent;
            }),
          ],
        },
        DELETE: {
          target: ".deleted",
        },
      },
      states: {
        reading: {
          on: {
            SET_COMPLETED: {
              actions: [assign<TodoContext>({ completed: true }), "commit"],
            },
            TOGGLE_COMPLETE: {
              actions: [
                assign<TodoContext>({ completed: (ctx) => !ctx.completed }),
                "commit",
              ],
            },
            SET_ACTIVE: {
              actions: [assign<TodoContext>({ completed: false }), "commit"],
            },
            Edit: {
              actions: "focusInput",
              target: "editing",
            },
          },
        },
        editing: {
          entry: assign<TodoContext>({ prevTitle: (ctx) => ctx.title }),
          on: {
            CHANGE: {
              actions: assign<TodoContext, ChangeEvent>({
                title: (_, event) => event.value,
              }),
            },
            COMMIT: [
              {
                cond: (ctx) => ctx.title.trim().length > 0,
                target: "reading",
                actions: sendParent<TodoContext, TodosEvent>((ctx) => {
                  return {
                    type: "todo_commit",
                    todo: ctx,
                  } as TodosEvent;
                }),
              },
              {
                target: "deleted",
              },
            ],
            BLUR: {
              target: "reading",
              actions: sendParent<TodoContext, TodoEvent>((todo) => {
                return {
                  type: "todo_commit",
                  todo,
                } as TodosEvent;
              }),
            },
            CANCEL: {
              actions: assign<TodoContext>({ title: (ctx) => ctx.prevTitle }),
              target: "reading",
            },
          },
        },
        deleted: {
          onEntry: sendParent<TodoContext, TodosEvent>((ctx) => {
            return {
              type: "todo_delete",
              id: ctx.id,
            } as TodosEvent;
          }),
        },
      },
    },
    {
      actions: {
        commit: sendParent((todo) => {
          return { type: "todo_commit", todo } as TodosEvent;
        }),
        focusInput: () => {},
      },
    }
  );
