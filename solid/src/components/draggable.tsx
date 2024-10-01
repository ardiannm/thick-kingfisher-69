import { Component, JSXElement, Signal, createSignal, onCleanup } from "solid-js";
import { Position } from "./bezier.curve";

interface Props {
  position?: Signal<Position>;
  children: JSXElement;
}

const Draggable: Component<Props> = (props: Props) => {
  const defaultPosition = createSignal({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  const [position, setPosition] = props.position ?? defaultPosition;

  const [isDragging, setIsDragging] = createSignal(false);
  const [offset, setOffset] = createSignal({ x: 0, y: 0 });

  const handleMouseDown = (event: MouseEvent) => {
    setIsDragging(true);
    setOffset({
      x: event.clientX - position().x,
      y: event.clientY - position().y,
    });
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (isDragging()) {
      setPosition({
        x: event.clientX - offset().x,
        y: event.clientY - offset().y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
  onCleanup(() => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  });

  return (
    <div
      style={{
        position: "absolute",
        left: `${position().x}px`,
        top: `${position().y}px`,
        cursor: isDragging() ? "grabbing" : "grab",
        height: "fit-content",
        width: "fit-content",
        "z-index": "140",
      }}
      onmousedown={handleMouseDown}
      onclick={() => console.log(2)}
    >
      {props.children}
    </div>
  );
};

export default Draggable;
