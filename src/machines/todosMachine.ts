import { assign, createMachine, spawn, actions } from "xstate";
import { uuid } from "uuidv4";
import { TodoActor, Todo, createTodoMachine } from "./todoMachine";

type TodosContext = {
  todo: string;
  todos: TodoActor[];
  filter: "all";
};

type NewTodoChangeEvent = {
  type: "newTodo_change";
  value: string;
};

type NewTodoCommitEvent = {
  type: "newTodo_commit";
  value: string;
};

type TodoCommitEvent = {
  type: "todo_commit";
  todo: Todo;
};

type TodoDeleteEvent = {
  type: "todo_delete";
  id: string;
};

type TodoShow = {
  type: "show";
  filter: "all";
};

export type TodosEvent =
  | NewTodoChangeEvent
  | NewTodoCommitEvent
  | TodoCommitEvent
  | TodoDeleteEvent
  | TodoShow;

export const todosMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QBcD2FWwHQBtUEMIBLAOygGJFQAHTI5I1EqkAD0QFoAWADh66w8ATFwCcXAAwSAbAFZh0gDQgAnpzECJogMxChARm0B2CVzE8AvheVoMsciTAB3ACrpUAfQDGAC3xkwFlpYekZmJDZ1OX1BIRktCSFpI2TlNQQOaW0Y6TEJHmlRfSyk6Ssbd3tHV3dvVABbevogugYmFnYMrmisaT0jQx4jbWl9HjTOWQkYiSMjSSMRPX1ZIXKQW0xyTbrG5ojg0PaIzu4jYSwkwzF9RNkjUVkJjKLZLH1RLVvtRJFZMusG0q21qEDAODAyECB1aYQ66lEfSw8n0tymg1Gzw4r3enyKEh+ei4-3Wm3ssB8qCcLRCbXCoFOqwkbzEOn4C1m2ixoyE7zyoj0wmZxNJwPq+AATgBrXbUCFQiA0o70yJdOZvOIGQo8Fb3URY4oSXFCB76XjSHjaNmiuzkcXSjz4LwMABu0JosOODIRSJkpoFkiEloNsgE2l0symoctVptWy8EMlsvlkCVdPhGSZomRXGy530KWMSlU6guhTiyW0KNksm0VkBJHQcBYZNwBGIZDTcJOpaMb1EfZE02m3S5JYyWW0734OgtqNDczj2AlYEI6Q9tO73q6QynJimPFEPGZ+SxXDGWFzJt4VqyiLrgLJXa9qu4nx4sQ0UjkCix++nYhBkW8wWvWFhAA */
  createMachine(
    {
      context: { todo: "", todos: [], filter: "all" } as TodosContext,
      tsTypes: {} as import("./todosMachine.typegen").Typegen0,
      id: "todos",
      initial: "loading",
      states: {
        loading: {
          entry: assign<TodosContext>({
            todos: (ctx) => {
              return ctx.todos.map((todo) => ({
                ...todo,
                ref: spawn(createTodoMachine(todo)),
              }));
            },
          }),
          always: {
            target: "ready",
          },
        },
        ready: {},
      },
      on: {
        newTodo_change: {
          actions: assign<TodosContext, NewTodoChangeEvent>({
            todo: (_, event) => event.value,
          }),
        },
        newTodo_commit: {
          actions: [
            assign<TodosContext, NewTodoCommitEvent>({
              todo: "",
              todos: (ctx, event) => {
                const newTodo: Todo = {
                  id: uuid(),
                  title: event.value,
                  completed: false,
                };

                return ctx.todos.concat([
                  {
                    ...newTodo,
                    ref: spawn(createTodoMachine(newTodo)),
                  },
                ]);
              },
            }),
            "persist",
          ],
          cond: (_, event) => event.value.trim().length,
        },
        todo_commit: {
          actions: [
            assign<TodosContext, TodoCommitEvent>({
              todos: (ctx, evt) => {
                return ctx.todos.map((todo) => {
                  return todo.id === evt.todo.id
                    ? {
                        ...todo,
                        ...evt.todo,
                        ref: todo.ref,
                      }
                    : todo;
                });
              },
            }),
            "persist",
          ],
        },
        todo_delete: {
          actions: [
            assign<TodosContext, TodoDeleteEvent>({
              todos: (ctx, event) =>
                ctx.todos.filter((todo) => todo.id !== event.id),
            }),
            "persist",
          ],
        },
        show: {
          actions: assign<TodosContext, TodoShow>({
            filter: (_, evt) => evt.filter,
          }),
        },
        mark_completed: {
          actions: (ctx) => {
            ctx.todos.forEach((todo) => todo.ref.send("SET_COMPLETED"));
          },
        },
        mark_active: {
          actions: (ctx) => {
            ctx.todos.forEach((todo) => todo.ref.send("SET_ACTIVE"));
          },
        },
        clear_completed: {
          actions: [
            actions.pure<TodosContext, TodosEvent>((ctx) =>
              ctx.todos
                .filter((todo) => todo.completed)
                .map((todo) => actions.stop(todo.ref.id))
            ),
            assign<TodosContext, TodosEvent>({
              todos: (ctx) => ctx.todos.filter((todo) => todo.completed),
            }),
          ],
        },
      },
    },
    {
      actions: {
        persist: (ctx) => {
          try {
            localStorage.setItem("todos-xstate", JSON.stringify(ctx.todos));
          } catch (e) {
            console.error(e);
          }
        },
      },
    }
  );
