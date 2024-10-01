import { Signal, type Component } from "solid-js";
import Draggable from "./draggable";
import { Position } from "./bezier.curve";

interface DotProps {
  position: Signal<Position>;
}

export const Dot: Component<DotProps> = (props: DotProps) => {
  // Box positions for start and end points
  const size = 8;

  return (
    <Draggable position={props.position}>
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
    </Draggable>
  );
};
