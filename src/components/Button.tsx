import React from "react";

export default function () {
  return (
    <button
      onClick={(_) => {
        alert("hello");
      }}
    >
      click me
    </button>
  );
}
