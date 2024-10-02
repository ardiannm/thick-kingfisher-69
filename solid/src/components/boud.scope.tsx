import { Accessor, For, Show, Signal, createEffect, createSignal } from "solid-js";
import styles from "../styles/bound.scope.module.scss";
import { BoundScope } from "../../../src/analysis/binder/bound.scope";
import { BoundCellAssignment } from "../../../src/analysis/binder";
import Draggable from "./draggable";
import { Position } from "./bezier.curve";
import stackStyles from "../styles/stack.module.scss";

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

  const renderArr = (node: Array<BoundCellAssignment>) => {
    return (
      <div class={stackStyles.observers}>
        <For each={node}>
          {(assignment) => (
            <div class={stackStyles.observer}>
              {assignment.reference.name} [{assignment.count()}]
            </div>
          )}
        </For>
      </div>
    );
  };

  createEffect(() => {
    loadObservers();
    loadObservers();
  });

  const updateArr = () => setArr([...scope().stack.map((s) => [...s])]);

  const loadObservers = () => {
    const n = scope().peekStack();
    n?.stackObservers();
    updateArr();
  };

  const unloadObservers = () => {
    scope().popStack();
    updateArr();
  };

  return (
    <>
      <Show when={scope().observers.size}>
        <Draggable position={props.position}>
          <div class={styles.scope}>
            <For each={[...scope().observers.entries()]}>
              {([k, v]) => (
                <div class={styles.connection}>
                  {k} ► {renderSet(v)}
                </div>
              )}
            </For>
          </div>
        </Draggable>
        {/* boundstack */}
        <Show when={arr().length && arr()[0].length}>
          <Draggable position={stackPosition}>
            <div class={stackStyles.buttons}>
              <div class={stackStyles.button} onmousedown={loadObservers}>
                +
              </div>
              <div class={stackStyles.button} onmousedown={unloadObservers}>
                -
              </div>
            </div>
            <div class={stackStyles.stack}>
              <For each={arr()}>{(item) => <div>{renderArr(item)}</div>}</For>
            </div>
          </Draggable>
        </Show>
      </Show>
    </>
  );
};

export default BoudScopeComponent;
