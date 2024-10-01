import { For } from "solid-js";
import styles from "../styles/bound.scope.module.scss";
import { BoundScope } from "../../../src/analysis/binder/bound.scope";
import { BoundCellAssignment } from "../../../src/analysis/binder";

export default class Graph {
  constructor(private scope: BoundScope) {}

  render() {
    return (
      <div class={styles.scope}>
        <For each={[...this.scope.observers.entries()]}>
          {([k, v]) => (
            <div class={styles.connection}>
              {k} ◄ {this.renderSet(v)}
            </div>
          )}
        </For>
      </div>
    );
  }

  private renderNode(node: BoundCellAssignment) {
    return <div class={styles.node}>{node.reference.name}</div>;
  }

  private renderSet(v: Set<BoundCellAssignment>) {
    return (
      <div class={styles.set}>
        <For each={[...v]}>{(v) => this.renderNode(v)}</For>
      </div>
    );
  }
}
