import { Accessor, For, Signal } from "solid-js";
import styles from "../styles/bound.scope.module.scss";
import { BoundScope } from "../../../src/analysis/binder/bound.scope";
import { BoundCellAssignment } from "../../../src/analysis/binder";
import Draggable from "./draggable";
import { Position } from "./bezier.curve";

interface GraphProps {
  scope: Accessor<BoundScope>; // Define props for the functional component
  position: Signal<Position>;
}

const BoudScopeComponent = (props: GraphProps) => {
  const scope = props.scope; // Destructure scope from props

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

  return (
    <Draggable position={props.position}>
      <div class={styles.scope}>
        <For each={[...scope().observers.entries()]}>
          {([k, v]) => (
            <div class={styles.connection}>
              {k} ◄ {renderSet(v)}
            </div>
          )}
        </For>
      </div>
    </Draggable>
  );
};

export default BoudScopeComponent;
