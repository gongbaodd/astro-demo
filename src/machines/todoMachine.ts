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
  /** @xstate-layout N4IgpgJg5mDOIC5QBcD2FUDoBOYCGEAlgHZQDEAygKIAqA+gMIDyAsgAoAytVAIoqAAdUsQskKpi-EAA9EAWgCMATgAsKzACYA7AGYFABiUKVypUoBsAGhABPeQA5zCzMvMaN5gKyfHK+xoBfAOs0DBx8IlIyGiYAcViuRlZObikhETEJKVkEOQ0FHS1NBXsVc3MVfUMFCus7XIN9Zx13JX17ZU98rQUgkPQsXAIScmp6AEEGGgBJADUqNOFRcUkkGXl3H0wdTyrzQ3MdQ-a6+QUFDXV9EyqtTzutJR0+kFDBiJGyKiJkRYyV7IbJSXTBGDQ6JT2dpGJ5WWxnfLNexmFQ+cG6AovN6YSDLKIMAAS4wAcrEFmt0sssmscnlIfpMPodE17C00R0dKdclpzEpMBUauYtCpEfdesFXgMcT9PswWCxpjQ-lTVqBaR5zqCtPZvF0NNUFFy5BzNFVCtqTO5wVipbixFEAEIcACqACVlZlVetchpPDp7Pz-YYqp0tNojQY7i57rpefcVEobWE7bKSQwqBwPQCaRtzFD+TqWiYMQcI-oowoY-c80pPG1AhK3tE4gkqEl2FwaOTBEtPYCfcCdIyOsL8gnKr6I35PPynk1teXzSok6gyDwM6kKb3s2qzmGh0cRU4rWolEb-EVXOC2gVDCpni9iOg4FJsUNIlAs9Tdz61EVPKi1SOKo9ycvCDT5AG7TQV4+72GGK7Snin5bv837enkeYzk8PK7Fo+jgiYRqqM4pS+DoIrGKoDb9GEEBgAANmAyCQF+XrqgR6h5roGhPKi8F+EaPQzvq1yVt4R7AiubH9nIzLXIyzIlGy-gchGzIaMO0FdEcrL+EEQRAA */
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
                actions: sendParent<TodoContext, TodosEvent>((ctx) => {
                  return {
                    type: "todo_commit",
                    todo: ctx,
                  } as TodosEvent;
                }),
                cond: (ctx) => ctx.title.trim().length > 0,
                target: "reading",
              },
              {
                target: "deleted",
              },
            ],
            BLUR: {
              actions: sendParent<TodoContext, TodoEvent>((todo) => {
                return {
                  type: "todo_commit",
                  todo,
                } as TodosEvent;
              }),
              target: "reading",
            },
            CANCEL: {
              actions: assign<TodoContext>({ title: (ctx) => ctx.prevTitle }),
              target: "reading",
            },
          },
        },
        deleted: {
          entry: sendParent<TodoContext, TodosEvent>((ctx) => {
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
