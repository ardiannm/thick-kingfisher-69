import styles from "./styles/app.module.scss";

import { type Component, createSignal } from "solid-js";
import { BezierCurve, Position } from "./components/bezier.curve";
import { CodeEditor } from "./components/code.editor";

var defaultCode = `A1 :: A6
A2 :: A1
A3 :: A1+A2+A4+A5
A6 :: A1+A2+A5


''' just show which reference is causing circular dependency that's all that matters '''`;

const App: Component = () => {
  const start = createSignal<Position>({ x: 183, y: 618 });
  const end = createSignal<Position>({ x: 367, y: 275 });
  const textCode = createSignal<string>(defaultCode);

  return (
    <div class={styles.app}>
      <CodeEditor code={textCode} />
      {/* <BezierCurve startPosition={start} endPosition={end} dots /> */}
    </div>
  );
};

export default App;
