import { Node } from "./definitions/node-definition.ts";
import { BinaryNode } from "./definitions/nodes/binary.ts";
import { CellNode } from "./definitions/nodes/cell.ts";
import { ErrorNode } from "./definitions/nodes/error.ts";
import { NumberNode } from "./definitions/nodes/number.ts";
import { RangeNode } from "./definitions/nodes/range.ts";
import { UnaryNode } from "./definitions/nodes/unary.ts";
import { ErrorValue } from "./definitions/values/error.ts";
import { NumberValue } from "./definitions/values/number.ts";
import { ReferenceValue } from "./definitions/values/reference.ts";
import { toLetter, toNumber } from "./services.ts";
import { RuntimeValue } from "./definitions/values/value.ts";
import { MoveNode } from "./definitions/nodes/move.range.ts";

export class Interpreter {
  evaluate<N extends Node>(node: N): RuntimeValue {
    if (node instanceof NumberNode) return this.evaluateNumber(node);
    if (node instanceof CellNode) return this.evaluateCell(node);
    if (node instanceof RangeNode) return this.evaluateRange(node);
    if (node instanceof BinaryNode) return this.evaluateBinary(node);
    if (node instanceof UnaryNode) return this.evaluateUnary(node);
    if (node instanceof MoveNode) return this.evaluateMove(node);
    if (node instanceof ErrorNode) return new ErrorValue(node.font);
    return new ErrorValue(
      "" + node.type + " has not been implemented for interpretation",
    );
  }

  private evaluateMove(node: MoveNode) {
    const left = this.evaluate(node.left) as ReferenceValue;
    const right = this.evaluate(node.right) as NumberValue;
    //
    if (node.left instanceof CellNode) {
      if (node.operator === "&C") {
        return new CellNode(
          node.left.row,
          left.left ? toLetter(left.left + right.value) : "",
        );
      }
      // By default &R operator for moving row-wise
      return new CellNode(
        left.top ? (left.top + right.value).toString() : "",
        node.left.column,
      );
    }
    if (node.left instanceof RangeNode) {
      // Perform a move operation on the left cell
      const left = this.evaluateMove(
        new MoveNode(node.left.left, node.operator, node.right),
      ) as CellNode;
      // Perform a move operation on the right cell
      const right = this.evaluateMove(
        new MoveNode(node.left.right, node.operator, node.right),
      ) as CellNode;
      return new RangeNode(left, right);
    }
    return new ErrorNode(
      "Can't perfrom a move operation over '" + node.left.type.toLowerCase() +
      "' values",
    );
  }

  private evaluateCell(node: CellNode): ReferenceValue {
    const row = parseFloat(node.row);
    const column = parseFloat(toNumber(node.column));
    return new ReferenceValue(column, row, 0, 0);
  }

  private evaluateRange(node: RangeNode): ReferenceValue {
    const value = new ReferenceValue(0, 0, 0, 0);
    // By convention all undefined properties will be kept at zero, as there is no row zero or column zero
    if (node.left.row) value.top = parseFloat(node.left.row);
    if (node.right.row) value.bottom = parseFloat(node.right.row);
    if (node.left.column) value.left = parseFloat(toNumber(node.left.column));
    if (node.right.column) {
      value.right = parseFloat(toNumber(node.right.column));
    }
    return value;
  }

  private evaluateUnary(node: UnaryNode) {
    const right = this.evaluate(node.right) as NumberValue;
    if (!(right instanceof NumberValue)) {
      return new ErrorValue(
        "Cannot perform unary operations over " +
        node.right.type.toLowerCase() + " values",
      );
    }
    switch (node.operator) {
      case "-": {
        return new NumberValue(-right.value);
      }
      default: {
        return new NumberValue(right.value);
      }
    }
  }

  private evaluateBinary(node: BinaryNode) {
    const left = this.evaluate(node.left) as NumberValue;
    const right = this.evaluate(node.right) as NumberValue;
    if (!(left instanceof NumberValue) || !(right instanceof NumberValue)) {
      if (node.left.type.toLowerCase() == node.right.type.toLowerCase()) {
        return new ErrorValue(
          "Cannot perform binary operations between " +
          node.left.type.toLowerCase() + " values",
        );
      }
      return new ErrorValue(
        "Cannot perform binary operations between " +
        node.left.type.toLowerCase() +
        " and " +
        node.right.type.toLowerCase() +
        " values",
      );
    }
    switch (node.operator) {
      case "+": {
        return new NumberValue(left.value + right.value);
      }
      case "-": {
        return new NumberValue(left.value - right.value);
      }
      case "*": {
        return new NumberValue(left.value * right.value);
      }
      default: {
        return new NumberValue(left.value / right.value);
      }
    }
  }

  private evaluateNumber(node: NumberNode): NumberValue {
    return new NumberValue(parseFloat(node.font));
  }
}
