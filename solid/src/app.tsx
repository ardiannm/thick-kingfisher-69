import styles from "./styles/app.module.scss";
import Input from "./components/screen";

import { type Component, Signal, createSignal } from "solid-js";
import { BezierCurve, Position } from "./components/bezier";

interface DotPosition {
  position: Signal<Position>;
}

const Dot: Component<DotPosition> = (props: DotPosition) => {
  // Box positions for start and end points

  const size = 10;
  const [pos] = props.position;

  return (
    <span
      style={{
        position: "absolute",
        left: `${pos().x - size / 2}px`,
        top: `${pos().y - size / 2}px`,
        width: `${size}px`,
        height: `${size}px`,
        "border-radius": `50%`,
        background: "black",
        "z-index": "11",
        cursor: "pointer",
      }}
    ></span>
  );
};

const App: Component = () => {
  // Box positions for start and end points
  const start = createSignal<Position>({ x: 100, y: 100 });
  const end = createSignal<Position>({ x: 300, y: 200 });

  return (
    <div class={styles.app}>
      <Dot position={start}></Dot>
      <BezierCurve point1={start} point2={end} />
      <Input />
    </div>
  );
};

export default App;
