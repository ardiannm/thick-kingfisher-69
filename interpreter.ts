import Binary from "./binary.ts";
import Division from "./division.ts";
import Multiplication from "./multiplication.ts";
import Number from "./number.ts";
import Parenthesis from "./parenthesis.ts";
import Parser from "./parser.ts";
import Program from "./program.ts";
import InterpreterError from "./interpreter.error.ts";
import RuntimeNumber from "./runtime.number.ts";
import RuntimeValue from "./runtime.value.ts";
import Token from "./token.ts";
import Unary from "./unary.ts";
import Substraction from "./substraction.ts";
import Exponentiation from "./exponentiation.ts";
import Component from "./component.ts";
import PlainText from "./plain.text.ts";

export default class Interpreter extends Parser {
  public run() {
    const tree = this.parse();
    const runtime = this.evaluate(tree);
    const firstError = this.errors[0];
    const lines = this.input.substring(firstError.from, firstError.to).split("\n");
    return {
      input: firstError ? lines.map((line, index) => `${index + 1}\t${line}`).join("\n") : [],
      errors: this.errors,
      runtime,
      parser: tree,
    };
  }

  evaluate<T extends Token>(token: T): RuntimeValue {
    if (token instanceof Program) return this.evaluateProgram(token);
    if (token instanceof Binary) return this.evaluateBinary(token);
    if (token instanceof Number) return this.evaluateNumber(token);
    if (token instanceof Unary) return this.evaluateUnary(token);
    if (token instanceof Parenthesis) return this.evaluateParenthesis(token);
    if (token instanceof Component) return this.evaluateComponent(token);
    if (token instanceof PlainText) return this.evaluatePlainText(token);
    return this.report(new InterpreterError(`Token type "${token.token}" has not been implemented for interpretation.`, token.from, token.to));
  }

  private evaluateComponent(token: Component) {
    const value = token.components.map((comp) => this.evaluate(comp));
    if (value.length == 1) return value[0];
    return value.filter((b) => !(Array.isArray(b) && b.length == 0));
  }

  private evaluatePlainText(token: PlainText) {
    return token.source;
  }

  private evaluateProgram(token: Program) {
    let value = new RuntimeValue();
    token.expressions.forEach((e) => (value = this.evaluate(e)));
    return value;
  }

  private evaluateNumber(token: Number) {
    return new RuntimeNumber(parseFloat(token.raw));
  }

  private evaluateBinary(token: Binary) {
    const left = this.evaluate(token.left);
    const right = this.evaluate(token.right);

    if (!(left instanceof RuntimeNumber) || !(right instanceof RuntimeNumber)) {
      return this.report(new InterpreterError(`Can't perform binary operations between "${token.left.token}" and "${token.right.token}" tokens.`, token.from, token.to));
    }

    switch (true) {
      case token.operator instanceof Substraction:
        return new RuntimeNumber(left.value - right.value);
      case token.operator instanceof Multiplication:
        return new RuntimeNumber(left.value * right.value);
      case token.operator instanceof Division:
        return new RuntimeNumber(left.value / right.value);
      case token.operator instanceof Exponentiation:
        return new RuntimeNumber(left.value ** right.value);
      default:
        return new RuntimeNumber(left.value + right.value);
    }
  }

  private evaluateUnary(token: Unary) {
    const right = this.evaluate(token.right);

    if (!(right instanceof RuntimeNumber)) {
      return this.report(new InterpreterError(`Can't perform unary operation over "${token.right.constructor.name}" token`, token.from, token.to));
    }

    switch (true) {
      case token.operator instanceof Substraction:
        return new RuntimeNumber(-right.value);
      default:
        return new RuntimeNumber(+right.value);
    }
  }

  private evaluateParenthesis(token: Parenthesis) {
    return this.evaluate(token.expression);
  }
}
