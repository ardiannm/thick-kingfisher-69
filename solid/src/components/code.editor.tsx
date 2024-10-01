import styles from "../styles/editor.module.scss";
import { type Component, Signal } from "solid-js";
import Draggable from "./draggable";
import { Position } from "./bezier.curve";

export interface CodeEditorProps {
  code: Signal<string>;
  position?: Signal<Position>;
}

export type Input = InputEvent & {
  currentTarget: HTMLTextAreaElement;
  target: HTMLTextAreaElement;
};

export const CodeEditor: Component<CodeEditorProps> = (props: CodeEditorProps) => {
  // Box positions for start and end points
  const [text, setText] = props.code;

  const handleTextAreaInput = (e: Input) => setText(e.target.value);
  const stopPropagation = (e: MouseEvent) => e.stopPropagation();

  return (
    <Draggable position={props.position}>
      <span class={styles.codeEditor}>
        <span class={styles.moveBar}></span>
        <textarea
          class={styles.textArea}
          spellcheck={false}
          oninput={handleTextAreaInput}
          onmousedown={stopPropagation} // Stop event propagation
          value={text()}
          autofocus={true}
        />
      </span>
    </Draggable>
  );
};
