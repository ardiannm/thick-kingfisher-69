// Define the type for position
export interface Position {
  x: number;
  y: number;
}

// Props interface for the BezierCurve component
interface BezierCurveProps {
  start: Position;
  end: Position;
}

export const BezierCurve = (props: BezierCurveProps) => {
  // Function to generate the Bezier curve path based on the start and end positions
  const curvePath = () => {
    const { start, end } = props;

    // Define control points to create a smooth curve
    const controlX1 = start.x + 150;
    const controlY1 = start.y;
    const controlX2 = end.x - 150;
    const controlY2 = end.y;

    // Return the SVG path for the Bezier curve
    return `M ${start.x},${start.y} C ${controlX1},${controlY1}, ${controlX2},${controlY2}, ${end.x},${end.y}`;
  };

  return (
    <svg
      style={{
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
      }}
    >
      <path d={curvePath()} stroke="black" fill="transparent" stroke-width="2" />
    </svg>
  );
};
