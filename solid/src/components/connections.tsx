import { For } from "solid-js";
import styles from "../styles/connections.module.scss";
import { BoundScope } from "../../../src/analysis/binder/bound.scope";
import { BoundCellAssignment } from "../../../src/analysis/binder";

export default class Graph {
  constructor(private scope: BoundScope) {}

  drawNode(node: BoundCellAssignment) {
    return <div class={styles.node}>{node.reference.name}</div>;
  }

  draw() {
    return (
      <div class={styles.connections}>
        <For each={[...this.scope.observers.entries()]}>
          {([k, v]) => (
            <div class={styles.connection}>
              {k} ◄ {this.drawSet(v)}
            </div>
          )}
        </For>
      </div>
    );
  }

  drawSet(v: Set<BoundCellAssignment>) {
    return (
      <div class={styles.set}>
        <For each={[...v]}>{(v) => this.drawNode(v)}</For>
      </div>
    );
  }
}
