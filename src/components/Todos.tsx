import React from "react";
import { todosMachine } from "../machines/todosMachine";
import "todomvc-app-css/index.css";

export function Todos() {
  return (
    <section className="todoapp">
      <header className="header">
        <h1>todos</h1>
        <input
          type="text"
          className="new-todo"
          placeholder="What needs to be done?"
          autoFocus
          onKeyPress={(e) => {
            if ("Enter" == e.key) {
            }
          }}
        />
      </header>
    </section>
  );
}
