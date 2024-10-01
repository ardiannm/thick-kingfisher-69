import { Component, JSXElement, Show, Signal, createSignal, onCleanup, onMount } from "solid-js";
import { Position } from "./bezier.curve";
import styles from "../styles/draggable.module.scss";

interface DraggableProps {
  position?: Signal<Position>; // Make position optional
  children?: JSXElement;
  select?: boolean;
}

const Draggable: Component<DraggableProps> = (props: DraggableProps) => {
  const [position, setPosition] = props.position ?? createSignal({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = createSignal(false);
  const [isFocused, setIsFocused] = createSignal(props.select ?? false);
  const [offset, setOffset] = createSignal({ x: 0, y: 0 });

  var element: HTMLDivElement | undefined;

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

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);

  onCleanup(() => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  });

  return (
    <span
      ref={element}
      tabIndex={0} // Make the element focusable
      class={styles.draggable}
      ondblclick={centerElement}
      onfocus={handleFocus}
      onblur={handleBlur}
      onmousedown={handleMouseDown}
      style={{
        position: "absolute",
        left: `${position().x}px`,
        top: `${position().y}px`,
        cursor: isDragging() ? "grabbing" : "grab",
        height: "fit-content",
        width: "fit-content",
        "z-index": isDragging() || isFocused() ? 4000 : "auto",
        outline: isDragging() ? "1px solid lightcoral" : "none",
      }}
    >
      <div class={styles.coordinates}>
        {Math.floor(position().x)}:{Math.floor(position().y)}
      </div>
      {props.children}
    </span>
  );
};

export default Draggable;
