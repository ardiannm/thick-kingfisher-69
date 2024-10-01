import { Component, JSXElement, Signal, createSignal, onCleanup, onMount } from "solid-js";
import { Position } from "./bezier.curve";

interface Props {
  position?: Signal<Position>; // Make position optional
  children: JSXElement;
}

const Draggable: Component<Props> = (props: Props) => {
  // If props.position is undefined, create a default signal with the center position
  const [position, setPosition] = props.position ?? createSignal({ x: 0, y: 0 });

  const [isDragging, setIsDragging] = createSignal(false);
  const [offset, setOffset] = createSignal({ x: 0, y: 0 });

  var element: HTMLDivElement | undefined;

  // Function to calculate the center of the screen accounting for the element's dimensions
  const centerElement = () => {
    if (element) {
      const elementWidth = element.offsetWidth;
      const elementHeight = element.offsetHeight;

      setPosition({
        x: window.innerWidth / 2 - elementWidth / 2,
        y: window.innerHeight / 2 - elementHeight / 2,
      });
    }
  };

  onMount(() => {
    // Set initial position when the element is mounted
    if (!props.position) {
      centerElement();
    }
  });

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
    <span
      ref={element} // Reference to the element for size calculations
      ondblclick={centerElement}
      style={{
        position: "absolute",
        left: `${position().x}px`,
        top: `${position().y}px`,
        cursor: isDragging() ? "grabbing" : "grab",
        height: "fit-content",
        width: "fit-content",
        // "z-index": "140",
      }}
      onmousedown={handleMouseDown}
    >
      {props.children}
    </span>
  );
};

export default Draggable;
