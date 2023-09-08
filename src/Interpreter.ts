import System from "./system/System";
import SystemException from "./system/SystemException";
import Binary from "./ast/expressions/Binary";
import Program from "./ast/expressions/Program";
import Unary from "./ast/expressions/Unary";
import Token from "./ast/tokens/Token";
import SystemNumber from "./system/SystemNumber";
import SystemString from "./system/SystemString";
import Substraction from "./ast/expressions/Substraction";
import Multiplication from "./ast/expressions/Multiplication";
import Division from "./ast/expressions/Division";
import Number from "./ast/expressions/Number";
import Exponentiation from "./ast/expressions/Exponentiation";
import Negation from "./ast/expressions/Negation";
import String from "./ast/expressions/String";
import Interpolation from "./ast/expressions/Interpolation";
import SpreadsheetCell from "./ast/spreadsheet/SpreadsheetCell";
import ColumnToNumber from "./services/ColumnToNumber";
import SpreadsheetRange from "./ast/spreadsheet/SpreadsheetRange";
import SystemSpreadsheetCell from "./system/SystemSpreadsheetCell";
import SystemSpreadsheetRange from "./system/SystemSpreadsheetRange";
import HTMLTextContent from "./ast/html/HTMLTextContent";
import HTMLElement from "./ast/html/HTMLElement";
import HTMLScript from "./ast/html/HTMLScript";
import HTMLComment from "./ast/html/HTMLComment";
import Identifier from "./ast/expressions/Identifier";
import SystemStringArray from "./system/SystemStringArray";

export default class Interpreter {
  evaluate<T extends Token>(token: T) {
    if (token instanceof Program) return this.evaluateProgram(token);
    if (token instanceof Identifier) return this.evaluateIdentifier(token);
    if (token instanceof Number) return this.evaluateNumber(token);
    if (token instanceof String) return this.evaluateString(token);
    if (token instanceof Interpolation) return this.evaluateInterpolation(token);
    if (token instanceof Unary) return this.evaluateUnary(token);
    if (token instanceof Binary) return this.evaluateBinary(token);
    if (token instanceof HTMLElement) return this.evaluateHTMLElement(token);
    if (token instanceof HTMLTextContent) return this.evaluateHTMLTextContent(token);
    if (token instanceof HTMLScript) return this.evaluateHTMLScript(token);
    if (token instanceof HTMLComment) return this.evaluateHTMLComment(token);
    if (token instanceof SpreadsheetCell) return this.evaluateSpreadsheetCell(token);
    if (token instanceof SpreadsheetRange) return this.evaluateSpreadsheetRange(token);

    throw new SystemException(`token type \`${token.type}\` has not been implemented for interpretation`);
  }

  private evaluateProgram(token: Program) {
    let value = new System();
    token.expressions.forEach((e) => (value = this.evaluate(e)));
    return value;
  }

  private evaluateNumber(token: Number) {
    return new SystemNumber(parseFloat(token.view));
  }

  private evaluateBinary(token: Binary) {
    const left = this.evaluate(token.left);
    const right = this.evaluate(token.right);

    if (!(left instanceof SystemNumber) || !(right instanceof SystemNumber)) {
      return new SystemException(`can't perform binary operations between \`${token.left.type}\` and "${token.right.type}" tokens`);
    }

    switch (true) {
      case token instanceof Substraction:
        return new SystemNumber(left.value - right.value);
      case token instanceof Multiplication:
        return new SystemNumber(left.value * right.value);
      case token instanceof Division:
        return new SystemNumber(left.value / right.value);
      case token instanceof Exponentiation:
        return new SystemNumber(left.value ** right.value);
      default:
        return new SystemNumber(left.value + right.value);
    }
  }

  private evaluateUnary(token: Unary) {
    const right = this.evaluate(token.right);

    if (!(right instanceof SystemNumber)) {
      return new SystemException(`can't perform unary operation over "${token.right.type}" token`);
    }

    switch (true) {
      case token instanceof Negation:
        return new SystemNumber(-right.value);
      default:
        return new SystemNumber(+right.value);
    }
  }

  private evaluateString(token: String) {
    return new SystemString(token.view);
  }

  private evaluateInterpolation(token: Interpolation) {
    let view = "";
    token.strings.forEach((token) => {
      const runtime = this.evaluate(token);
      if (runtime instanceof SystemNumber) {
        view += runtime.value.toString();
      } else if (runtime instanceof SystemString) {
        view += runtime.value;
      }
    });
    return new SystemString(view);
  }

  private evaluateSpreadsheetCell(token: SpreadsheetCell) {
    return new SystemSpreadsheetCell(parseFloat(token.row) || 0, ColumnToNumber(token.column));
  }

  private evaluateSpreadsheetRange(token: SpreadsheetRange) {
    const left = this.evaluate(token.left) as SystemSpreadsheetCell;
    const right = this.evaluate(token.right) as SystemSpreadsheetCell;
    return new SystemSpreadsheetRange(left, right);
  }

  private evaluateHTMLTextContent(token: HTMLTextContent) {
    return new SystemString(token.view);
  }

  private evaluateHTMLScript(token: HTMLScript) {
    return new SystemString(token.view);
  }

  private evaluateHTMLComment(token: HTMLComment) {
    return new SystemString(token.view);
  }

  private evaluateHTMLElement(token: HTMLElement) {
    return new SystemStringArray(token.children.map((e) => this.evaluate(e)));
  }

  private evaluateIdentifier(token: Identifier) {
    return new SystemString(token.view);
  }
}
