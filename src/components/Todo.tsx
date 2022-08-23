import React from "react";
import cn from "classnames";

export function Todo() {
  return (
    <li className={cn({})}>
      <div className="view">
        <input type="checkbox" className="toggle" />
        <label></label>
      </div>
    </li>
  );
}
