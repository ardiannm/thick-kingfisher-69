import styles from "../styles/stack.module.scss";
import { type Component, For, Signal, Show } from "solid-js";
import { BoundCellAssignment } from "../../../src/analysis/binder";
import Draggable from "./draggable";
import { Position } from "./bezier.curve";

export interface StackProps {
  stack: Array<Array<BoundCellAssignment>>;
  position?: Signal<Position>;
}

export const StackComponent: Component<StackProps> = (props: StackProps) => {
  const renderArr = (node: Array<BoundCellAssignment>) => {
    return (
      <div class={styles.observers}>
        <For each={node}>
          {(assignment) => (
            <div class={styles.observer}>
              {assignment.reference.name} [{assignment.count()}]
            </div>
          )}
        </For>
      </div>
    );
  };

  return (
    <Show when={props.stack.length && props.stack[0].length}>
      <Draggable position={props.position}>
        <div class={styles.stack}>
          <For each={props.stack}>{(item) => <div>{renderArr(item)}</div>}</For>
        </div>
      </Draggable>
    </Show>
  );
};
