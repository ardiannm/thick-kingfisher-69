import styles from "./styles/app.module.scss";
import Input from "./components/screen";

import { type Component, createSignal } from "solid-js";
import { BezierCurve, Position } from "./components/bezier";
import Draggable from "./components/draggable";
import Connections from "./components/connections";
import Graph from "./components/connections";

const Dot = () => {
  // Box positions for start and end points

  const size = 10;

  return (
    <span
      style={{
        position: "absolute", // Uncommented this line
        left: `${-size / 2}px`,
        top: `${-size / 2}px`,
        height: `${size}px`,
        width: `${size}px`, // Added width to make it circular
        "border-radius": "50%",
        "background-color": "black",
        "z-index": "40",
        cursor: "pointer",
      }}
    ></span>
  );
};

const App: Component = () => {
  // Box positions for start and end points
  const start = createSignal<Position>({ x: 183, y: 618 });
  const end = createSignal<Position>({ x: 367, y: 275 });

  return (
    <div class={styles.app}>
      <Draggable position={start}>
        <Dot />
      </Draggable>
      <Draggable position={end}>
        <Dot />
      </Draggable>
      <Input />
      <BezierCurve point1={start} point2={end} />
    </div>
  );
};

export default App;
