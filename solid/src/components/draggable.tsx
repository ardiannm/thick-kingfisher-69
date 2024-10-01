import { Component, JSXElement, Signal, createSignal, onCleanup, onMount } from "solid-js";
import { Position } from "./bezier.curve";
import styles from "../styles/draggable.module.scss";

interface Props {
  position?: Signal<Position>; // Make position optional
  children: JSXElement;
}

const Draggable: Component<Props> = (props: Props) => {
  const [position, setPosition] = props.position ?? createSignal({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = createSignal(false);
  const [offset, setOffset] = createSignal({ x: 0, y: 0 });
  const [isFocused, setIsFocused] = createSignal(false);

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
      ondblclick={centerElement}
      onfocus={handleFocus}
      onblur={handleBlur}
      onmousedown={handleMouseDown}
      class={styles.draggable}
      style={{
        position: "absolute",
        left: `${position().x}px`,
        top: `${position().y}px`,
        cursor: isDragging() ? "grabbing" : "grab",
        height: "fit-content",
        width: "fit-content",
        "z-index": isDragging() || isFocused() ? 4000 : "auto", // Set z-index to 4000 when dragging or focused
      }}
    >
      {props.children}
    </span>
  );
};

export default Draggable;
