import styles from "../styles/tree.module.scss";

import { JSX, For } from "solid-js";
import { BoundNode } from "../../../src/analysis/binder/bound.node";
import { BoundCompilationUnit } from "../../../src/analysis/binder/bound.compilation.unit";
import { BoundKind } from "../../../src/analysis/binder/kind/bound.kind";
import { BoundBinaryExpression } from "../../../src/analysis/binder/binary.expression";
import { BoundNumericLiteral } from "../../../src/analysis/binder/bound.numeric.literal";
import { BoundUnaryExpression } from "../../../src/analysis/binder/bound.unary.expression";
import { BoundCellAssignment, BoundCellReference } from "../../../src/analysis/binder";
import { BoundBinaryOperatorKind } from "../../../src/analysis/binder/kind/bound.binary.operator.kind";
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
      case BoundKind.BoundNoneToken:
        return <div class={styles.BoundNumericLiteral}>{0}</div>;
    }
    return <div class={styles.BoundErrorExpression}>{(node as NodeType<BoundErrorExpression>).kind}</div>;
  }

  private renderBoundCellReference(node: BoundCellReference): JSX.Element {
    return (
      <div class={styles.BoundCellReference}>
        <div class={styles.BoundCellReferenceName}>{node.name}</div>
        {this.render(node.expression)}
      </div>
    );
  }

  private renderBoundCellAssignment(node: BoundCellAssignment): JSX.Element {
    return (
      <div class={styles.BoundCellAssignment}>
        <div class={styles.BoundCellReferenceName}>{node.name}</div>
        {this.render(node.expression)}
      </div>
    );
  }

  private renderBoundUnaryExpression(node: BoundUnaryExpression): JSX.Element {
    return <div class={styles.BoundUnaryExpression}>{this.render(node.right)}</div>;
  }

  private renderBoundNumericLiteral(node: BoundNumericLiteral): JSX.Element {
    return <div class={styles.BoundNumericLiteral}>{node.value}</div>;
  }

  private renderBoundBinaryExpression(node: BoundBinaryExpression): JSX.Element {
    return (
      <div class={styles.BoundBinaryExpression}>
        {this.render(node.left)}
        {node.operatorKind === BoundBinaryOperatorKind.Addition ? "+" : "-"}
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
