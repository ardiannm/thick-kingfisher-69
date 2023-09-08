import Token from "../ast/tokens/Token";
import Constructor from "./Constructor";
import Lexer from "../Lexer";

export default class Service extends Lexer {
  private storeColumn?: number;

  private assert<T extends Token>(instance: Token, tokenType: Constructor<T>): boolean {
    return instance instanceof tokenType;
  }

  protected expect<T extends Token>(token: Token, tokenType: Constructor<T>, message: string): T {
    if (this.assert(token, tokenType)) return token as T;
    throw this.report(message);
  }

  protected doNotExpect<T extends Token>(token: Token, tokenType: Constructor<T>, message: string): T {
    if (this.assert(token, tokenType)) {
      throw this.report(message);
    }
    return token as T;
  }

  protected throwError(message: string) {
    throw this.report(message);
  }

  protected report(msg: string) {
    const input = this.input.split("\n");
    const n = this.line;
    const m = this.storeColumn || this.column;

    const report = new Array<string>();

    report.push("");
    report.push(`error: ${msg}`);
    report.push(` -- dev/tests/_tests_.am:${n}:${m}`);
    report.push("");

    if (input[n - 3] !== undefined) report.push(`    ${this.formatNumber(n - 2, n + 2)}   ${input[n - 3]}`);
    if (input[n - 2] !== undefined) report.push(`    ${this.formatNumber(n - 1, n + 2)}   ${input[n - 2]}`);
    if (input[n - 1] !== undefined) report.push(` >  ${this.formatNumber(n + 0, n + 2)}   ${input[n - 1]}`);
    if (input[n - 1] !== undefined) report.push(`    ${this.formatNumber(n + 0, n + 2).replace(/.+/g, " ")}   ${" ".repeat(this.storeColumn - 1)}^`);
    if (input[n - 0] !== undefined) report.push(`    ${this.formatNumber(n + 1, n + 2)}   ${input[n - 0]}`);
    if (input[n + 1] !== undefined) report.push(`    ${this.formatNumber(n + 2, n + 2)}   ${input[n + 1]}`);

    report.push("");

    this.storeColumn = undefined;
    return report.join("\n");
  }

  private formatNumber(num: number, offset: number) {
    const numString = num.toString();
    return " ".repeat(offset.toString().length - numString.length) + numString;
  }

  protected trackColumn() {
    this.storeColumn = this.column;
  }

  protected untrackColumn() {
    this.storeColumn = undefined;
  }
}
