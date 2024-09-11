import styles from "../styles/tree.module.scss";

import { JSX, For, Show } from "solid-js";
import { BoundNode } from "../../../src/analysis/binder/bound.node";
import { BoundCompilationUnit } from "../../../src/analysis/binder/bound.compilation.unit";
import { BoundKind } from "../../../src/analysis/binder/kind/bound.kind";
import { BoundBinaryExpression } from "../../../src/analysis/binder/binary.expression";
import { BoundNumericLiteral } from "../../../src/analysis/binder/bound.numeric.literal";
import { BoundUnaryExpression } from "../../../src/analysis/binder/bound.unary.expression";
import { BoundCellAssignment, BoundCellReference } from "../../../src/analysis/binder";
import { BoundErrorExpression } from "../../../src/analysis/binder/bound.error.expression";

export class MapTree {
  render<Kind extends BoundNode>(node: Kind): JSX.Element {
    type NodeType<T> = Kind & T;
    switch (node.kind) {
      case BoundKind.BoundCompilationUnit:
        return this.renderBoundCompilationUnit(node as NodeType<BoundCompilationUnit>);
      case BoundKind.BoundCellAssignment:
        return this.renderBoundCellAssignment(node as NodeType<BoundCellAssignment>);
      case BoundKind.BoundCellReference:
        return this.renderBoundCellReference(node as NodeType<BoundCellReference>);
      case BoundKind.BoundBinaryExpression:
        return this.renderBoundBinaryExpression(node as NodeType<BoundBinaryExpression>);
      case BoundKind.BoundUnaryExpression:
        return this.renderBoundUnaryExpression(node as NodeType<BoundUnaryExpression>);
      case BoundKind.BoundNumericLiteral:
        return this.renderBoundNumericLiteral(node as NodeType<BoundNumericLiteral>);
      case BoundKind.BoundNone:
        return <div class={styles.BoundNumericLiteral}>0</div>;
    }
    if (node instanceof BoundErrorExpression) return <div class={styles.BoundErrorExpression}>{(node as NodeType<BoundErrorExpression>).nodeKind}</div>;
    return <div class={styles.BoundErrorExpression}>{(node as NodeType<BoundErrorExpression>).kind}</div>;
  }

  private renderBoundCellAssignment(node: BoundCellAssignment): JSX.Element {
    return (
      <div class={styles.BoundCellAssignment}>
        <div class={styles.BoundCell}>{node.name}</div>
        {this.render(node.expression)}
        <Show when={node.dependencies.size || node.nodes.size}>
          {
            <div class={styles.Observers}>
              <Show when={node.dependencies.size}>
                {
                  <span class={styles.ObserversList}>
                    <For each={[...node.dependencies.values()]}>
                      {(dependency) => (
                        <div class={styles.Dependency}>
                          {dependency.name}({dependency.span.line})
                        </div>
                      )}
                    </For>
                  </span>
                }
              </Show>
              <Show when={node.nodes.size}>
                {
                  <span class={styles.ObserversList}>
                    <For each={[...node.nodes.values()]}>
                      {(node) => (
                        <div class={styles.Observer}>
                          {node.name}({node.span.line})
                        </div>
                      )}
                    </For>
                  </span>
                }
              </Show>
            </div>
          }
        </Show>
      </div>
    );
  }

  private renderBoundCellReference(node: BoundCellReference): JSX.Element {
    return (
      <div class={styles.BoundCellReference}>
        {node.cell.name}
        {/* {this.render(node.cell)} */}
      </div>
    );
  }

  private renderBoundUnaryExpression(node: BoundUnaryExpression): JSX.Element {
    return (
      <div class={styles.BoundUnaryExpression}>
        {/* {node.operatorKind === BoundUnaryOperatorKind.Identity ? "+" : "-"} */}
        {this.render(node.right)}
      </div>
    );
  }

  private renderBoundNumericLiteral(node: BoundNumericLiteral): JSX.Element {
    return <div class={styles.BoundNumericLiteral}>{node.value}</div>;
  }

  private renderBoundBinaryExpression(node: BoundBinaryExpression): JSX.Element {
    return (
      <div class={styles.BoundBinaryExpression}>
        {this.render(node.left)}
        {/* {node.operatorKind === BoundBinaryOperatorKind.Addition ? "+" : "-"} */}
        {this.render(node.right)}
      </div>
    );
  }

  renderBoundCompilationUnit(node: BoundCompilationUnit): JSX.Element {
    return (
      <div class={styles.BoundCompilationUnit}>
        <For each={node.root}>
          {(statement) => (
            <div class={styles.Statement}>
              {/* Render child node here */}
              {/* {statement.kind} */}
              {this.render(statement)}
            </div>
          )}
        </For>
      </div>
    );
  }
}
