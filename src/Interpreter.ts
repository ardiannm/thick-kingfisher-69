import System from "./system/System";
import SystemException from "./system/SystemException";
import Binary from "./ast/expressions/Binary";
import Program from "./ast/expressions/Program";
import Unary from "./ast/expressions/Unary";
import SyntaxToken from "./ast/tokens/SyntaxToken";
import SystemNumber from "./system/SystemNumber";
import SystemString from "./system/SystemString";
import Substraction from "./ast/expressions/Substraction";
import Multiplication from "./ast/expressions/Multiplication";
import Division from "./ast/expressions/Division";
import Number from "./ast/expressions/Number";
import Exponentiation from "./ast/expressions/Exponentiation";
import Negation from "./ast/expressions/Negation";
import String from "./ast/expressions/String";
import Cell from "./ast/spreadsheet/Cell";
import Range from "./ast/spreadsheet/Range";
import SystemCell from "./system/SystemCell";
import SystemRange from "./system/SystemRange";
import HTMLTextContent from "./ast/html/HTMLTextContent";
import HTMLElement from "./ast/html/HTMLElement";
import HTMLScript from "./ast/html/HTMLScript";
import HTMLComment from "./ast/html/HTMLComment";
import Identifier from "./ast/expressions/Identifier";
import SystemStringArray from "./system/SystemStringArray";
import Import from "./ast/expressions/Import";
import HTMLVoidElement from "./ast/html/HTMLVoidElement";
import InterpreterService from "./InterpreterService";
import Assignment from "./ast/expressions/Assignment";
import Environment from "./Environment";

const Interpreter = (env: Environment) => {
  const { columnToNumber } = InterpreterService();

  const evaluate = <T extends SyntaxToken>(token: T): System => {
    if (token instanceof Import) return evaluateImport(token);
    if (token instanceof Program) return evaluateProgram(token);
    // if (token instanceof Identifier) return evaluateIdentifier(token);
    if (token instanceof Number) return evaluateNumber(token);
    if (token instanceof String) return evaluateString(token);
    if (token instanceof Unary) return evaluateUnary(token);
    if (token instanceof Binary) return evaluateBinary(token);
    if (token instanceof HTMLElement) return evaluateHTMLElement(token);
    if (token instanceof HTMLVoidElement) return evaluateVoidHTMLElement(token);
    if (token instanceof HTMLTextContent) return evaluateHTMLTextContent(token);
    if (token instanceof HTMLScript) return evaluateHTMLScript(token);
    if (token instanceof HTMLComment) return evaluateHTMLComment(token);
    if (token instanceof Cell) return evaluateCell(token);
    if (token instanceof Range) return evaluateRange(token);
    if (token instanceof Assignment) return evaluateAssignment(token);

    throw new SystemException(`token type \`${token.type}\` has not been implemented for interpretation`);
  };

  const evaluateImport = (token: Import) => {
    return evaluate(token.program);
  };

  const evaluateProgram = (token: Program) => {
    let value = new System();
    token.expressions.forEach((e) => (value = evaluate(e)));
    return value;
  };

  const evaluateNumber = (token: Number) => {
    return new SystemNumber(parseFloat(token.view));
  };

  const evaluateBinary = (token: Binary) => {
    let left = evaluate(token.left);
    let right = evaluate(token.right);

    if (left instanceof SystemCell) left = left.value;
    if (right instanceof SystemCell) right = right.value;

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
  };

  const evaluateUnary = (token: Unary) => {
    const right = evaluate(token.right);

    if (!(right instanceof SystemNumber)) {
      return new SystemException(`can't perform unary operation over "${token.right.type}" token`);
    }

    switch (true) {
      case token instanceof Negation:
        return new SystemNumber(-right.value);
      default:
        return new SystemNumber(+right.value);
    }
  };

  const evaluateString = (token: String) => {
    return new SystemString(token.view);
  };

  const evaluateCell = (token: Cell) => {
    const row = parseFloat(token.row) || 0;
    const column = columnToNumber(token.column);
    const value = env.getVar(token.view);
    return new SystemCell(row, column, token.view, value);
  };

  const evaluateRange = (token: Range) => {
    const left = evaluate(token.left) as SystemCell;
    const right = evaluate(token.right) as SystemCell;
    return new SystemRange(left, right);
  };

  const evaluateHTMLTextContent = (token: HTMLTextContent) => {
    return new SystemString(token.view);
  };

  const evaluateHTMLScript = (token: HTMLScript) => {
    return new SystemString(token.view);
  };

  const evaluateHTMLComment = (token: HTMLComment) => {
    return new SystemString(token.view);
  };

  const evaluateVoidHTMLElement = (_: HTMLVoidElement) => {
    return new SystemString("");
  };

  const evaluateHTMLElement = (token: HTMLElement) => {
    return new SystemStringArray(token.children.map((e) => evaluate(e) as SystemString));
  };

  const evaluateAssignment = (token: Assignment) => {
    return env.assignVar(token.assignee.view, evaluate(token.value));
  };

  return { evaluate };
};

export default Interpreter;
