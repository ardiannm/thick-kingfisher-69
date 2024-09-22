import styles from "./styles/app.module.scss";

import type { Component } from "solid-js";
import Input from "./components/screen";
import { BezierCurve, Position } from "./components/bezier";

const App: Component = () => {
  // Box positions for start and end points
  const startPosition: Position = { x: 150, y: 100 };
  const endPosition: Position = { x: 300, y: 300 };

  return (
    <div class={styles.app}>
      <BezierCurve start={startPosition} end={endPosition} />
      <Input />
    </div>
  );
};

export default App;
