import { type Component, JSX, For } from "solid-js";
import { BoundNode } from "../../../src/analysis/binder/bound.node";
import { BoundCompilationUnit } from "../../../src/analysis/binder/bound.compilation.unit";
import { BoundKind } from "../../../src/analysis/binder/kind/bound.kind";
import { BoundCellReference } from "../../../src/analysis/binder/bound.cell.reference";
import { BoundCell } from "../../../src/analysis/binder/bound.cell";
import { BoundCellAssignment } from "../../../src/analysis/binder/bound.cell.assignment";
import { BoundBinaryExpression } from "../../../src/analysis/binder/binary.expression";

import styles from "../styles/tree.module.scss";
import { BoundNumericLiteral } from "../../../src/analysis/binder/bound.numeric.literal";
import { BoundDefaultZero } from "../../../src/analysis/binder/bound.default.zero";
import { BoundErrorExpression } from "../../../src/analysis/binder/bound.error.expression";
import { BoundUnaryExpression } from "../../../src/analysis/binder/bound.unary.expression";

export class MapTree {
  render<Kind extends BoundNode>(node: Kind): JSX.Element {
    type NodeType<T> = Kind & T;
    switch (node.kind) {
      case BoundKind.BoundCompilationUnit:
        return this.renderBoundCompilationUnit(node as NodeType<BoundCompilationUnit>);
      case BoundKind.BoundCellAssignment:
        return this.renderBoundCellAssignment(node as NodeType<BoundCellAssignment>);
      case BoundKind.BoundBinaryExpression:
        return this.renderBoundBinaryExpression(node as NodeType<BoundBinaryExpression>);
      case BoundKind.BoundUnaryExpression:
        return this.renderBoundUnaryExpression(node as NodeType<BoundUnaryExpression>);
      case BoundKind.BoundCellReference:
        return this.renderBoundCellReference(node as NodeType<BoundCellReference>);
      case BoundKind.BoundCell:
        return this.renderBoundCell(node as NodeType<BoundCell>);
      case BoundKind.BoundDefaultZero:
        return this.renderBoundDefaultZero(node as NodeType<BoundDefaultZero>);
      case BoundKind.BoundNumericLiteral:
        return this.renderBoundNumericLiteral(node as NodeType<BoundNumericLiteral>);
      case BoundKind.BoundErrorExpression:
        return this.renderBoundErrorExpression(node as NodeType<BoundErrorExpression>);
    }
    return this.renderBoundErrorExpression(node as NodeType<BoundErrorExpression>);
  }

  private renderBoundUnaryExpression(node: BoundUnaryExpression): JSX.Element {
    return <div class={styles.BoundUnaryExpression}>{this.render(node.right)}</div>;
  }

  private renderBoundErrorExpression(node: BoundErrorExpression): JSX.Element {
    return <div class={styles.BoundErrorExpression}>{node.kind}</div>;
  }

  private renderBoundDefaultZero(node: BoundDefaultZero): JSX.Element {
    return <div class={styles.BoundNumericLiteral}>{0}</div>;
  }

  private renderBoundNumericLiteral(node: BoundNumericLiteral): JSX.Element {
    return <div class={styles.BoundNumericLiteral}>{node.value}</div>;
  }

  private renderBoundBinaryExpression(node: BoundBinaryExpression): JSX.Element {
    return (
      <div class={node.kind}>
        <div class="left">{this.render(node.left)}</div>
        <div class="right">{this.render(node.right)}</div>
      </div>
    );
  }

  private renderBoundCellAssignment(node: BoundCellAssignment): JSX.Element {
    return <div class={node.kind}>{this.render(node.cell)}</div>;
  }

  private renderBoundCell(node: BoundCell): JSX.Element {
    return (
      <div class={styles.BoundCell}>
        <div class={styles.BoundCellName}>{node.name}</div>
        <div class="expression">{this.render(node.expression)}</div>
      </div>
    );
  }

  private renderBoundCellReference(node: BoundCellReference): JSX.Element {
    return <div class={node.kind}>{this.render(node.cell)}</div>;
  }

  renderBoundCompilationUnit(node: BoundCompilationUnit): JSX.Element {
    return (
      <div class={styles.BoundCompilationUnit}>
        <For each={node.root}>
          {(statement) => (
            <div class={styles.Statement}>
              {statement.kind}
              {/* Render child node here */}
              {this.render(statement)}
            </div>
          )}
        </For>
      </div>
    );
  }
}
