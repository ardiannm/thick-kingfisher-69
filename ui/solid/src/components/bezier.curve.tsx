import { Show, Signal, createSignal } from "solid-js";
import Draggable from "./draggable";

// Define the type for position
export interface Position {
  x: number;
  y: number;
}

// Props interface for the BezierCurve component
interface BezierCurveProps {
  startPosition: Signal<Position>;
  endPosition: Signal<Position>;
  dots?: boolean;
}

export const BezierCurve = (props: BezierCurveProps) => {
  const zIndex = createSignal(0);

  // Function to generate the Bezier curve path based on the start and end positions
  const curvePath = () => {
    const [point1] = props.startPosition;
    const [point2] = props.endPosition;

    // Define control points to create a smooth curve
    const controlX1 = point1().x + 120;
    const controlY1 = point1().y;
    const controlX2 = point2().x - 120;
    const controlY2 = point2().y;

    // Return the SVG path for the Bezier curve
    return `M ${point1().x},${point1().y} C ${controlX1},${controlY1}, ${controlX2},${controlY2}, ${point2().x},${point2().y}`;
  };

  return (
    <>
      <Show when={props.dots}>
        <Draggable position={props.startPosition} index={zIndex}></Draggable>
        <Draggable position={props.endPosition} index={zIndex}></Draggable>
      </Show>
      <svg style={{ position: "absolute", top: "0", left: "0", width: "100%", height: "100%", "z-index": zIndex[0](), "pointer-events": "none" }}>
        <path d={curvePath()} stroke="black" fill="transparent" stroke-width="2" />
      </svg>
    </>
  );
};
