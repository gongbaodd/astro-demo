import React, { useState } from "react";
import { createMachine, assign } from "xstate";
import { useMachine } from "@xstate/react";

type inputContext = {
  content: string;
};

type inputEvent = {
  type: "input";
  value: string;
};

const inputStateMachine = createMachine({
  schema: {
    context: {} as inputContext,
    events: {} as inputEvent,
  },
  id: "input",
  tsTypes: {} as import("./Input.typegen").Typegen0,
  initial: "idle",
  context: {
    content: "hello",
  } as inputContext,
  states: {
    idle: {
      on: {
        input: {
          actions: [
            assign<inputContext, inputEvent>({
              content: (_, evt) => {
                console.log(evt.value);
                return evt.value;
              },
            }),
          ],
        },
      },
    },
  },
});

export default function () {
  const [current, send] = useMachine(inputStateMachine);

  return (
    <label>
      <div>{current.context.content}</div>
      <input
        type="text"
        onChange={(e) => {
          send({ type: "input", value: e.target.value });
        }}
      />
    </label>
  );
}
