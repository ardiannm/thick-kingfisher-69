import { Accessor, For, Show, Signal, createSignal } from "solid-js";
import styles from "../styles/bound.scope.module.scss";
import { BoundScope } from "../../../src/analysis/binder/bound.scope";
import { BoundCellAssignment } from "../../../src/analysis/binder";
import Draggable from "./draggable";
import { Position } from "./bezier.curve";
import { StackComponent } from "./stack";

interface GraphProps {
  scope: Accessor<BoundScope>; // Define props for the functional component
  position: Signal<Position>;
}

const BoudScopeComponent = (props: GraphProps) => {
  const scope = props.scope; // Destructure scope from props
  const [arr, setArr] = createSignal<Array<Array<BoundCellAssignment>>>([[]]);
  const stackPosition = createSignal<Position>({ x: 1249, y: 383 });

  const renderNode = (node: BoundCellAssignment) => {
    return <div class={styles.node}>{node.reference.name}</div>;
  };

  const renderSet = (v: Set<BoundCellAssignment>) => {
    return (
      <div class={styles.set}>
        <For each={[...v]}>{(assignment) => renderNode(assignment)}</For>
      </div>
    );
  };

  const printPath = (k: string) => {
    const s = scope();
    const node = s.getAssignmentNode(k);
    node.stackObservers();
    setArr([...s.stack]);
  };

  return (
    <>
      <Show when={scope().observers.size}>
        <Draggable position={props.position}>
          <div class={styles.scope}>
            <For each={[...scope().observers.entries()]}>
              {([k, v]) => (
                <div class={styles.connection} onmousedown={() => printPath(k)}>
                  {k} ► {renderSet(v)}
                </div>
              )}
            </For>
          </div>
        </Draggable>
        <StackComponent stack={arr()} position={stackPosition}></StackComponent>
      </Show>
    </>
  );
};

export default BoudScopeComponent;
