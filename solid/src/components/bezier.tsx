import { Signal } from "solid-js";

// Define the type for position
export interface Position {
  x: number;
  y: number;
}

// Props interface for the BezierCurve component
interface BezierCurveProps {
  point1: Signal<Position>;
  point2: Signal<Position>;
}

export const BezierCurve = (props: BezierCurveProps) => {
  // Function to generate the Bezier curve path based on the start and end positions
  const curvePath = () => {
    const [point1] = props.point1;
    const [point2] = props.point2;

    // Define control points to create a smooth curve
    const controlX1 = point1().x + 120;
    const controlY1 = point1().y;
    const controlX2 = point2().x - 120;
    const controlY2 = point2().y;

    // Return the SVG path for the Bezier curve
    return `M ${point1().x},${point1().y} C ${controlX1},${controlY1}, ${controlX2},${controlY2}, ${point2().x},${point2().y}`;
  };

  return (
    <svg
      style={{
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        "z-index": "100",
        "pointer-events": "none",
      }}
    >
      <path d={curvePath()} stroke="black" fill="transparent" stroke-width="2" />
    </svg>
  );
};
