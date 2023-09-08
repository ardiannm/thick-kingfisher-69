import SyntaxToken from "../ast/tokens/SyntaxToken";
import Constructor from "./Constructor";
import Lexer from "../Lexer";

enum ColorCode {
  redColor = `\x1b[31m`,
  greenColor = `\x1b[32m`,
  blueColor = `\x1b[34m`,
  resetColor = `\x1b[0m`,
}

export default class Service extends Lexer {
  private storeColumn?: number;
  constructor(public input: string, public path: string) {
    super(input);
  }

  protected assert<T extends SyntaxToken>(instance: SyntaxToken, tokenType: Constructor<T>): boolean {
    return instance instanceof tokenType;
  }

  protected expect<T extends SyntaxToken>(token: SyntaxToken, tokenType: Constructor<T>, message: string): T {
    if (this.assert(token, tokenType)) return token as T;
    throw this.report(message);
  }

  protected doNotExpect<T extends SyntaxToken>(token: SyntaxToken, tokenType: Constructor<T>, message: string): T {
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
    report.push(` -- ${this.path}:${n}:${m}`);
    report.push("");

    if (input[n - 3] !== undefined) report.push(`  ${this.formatNumber(n - 2, n + 2)}   ${input[n - 3]}`);
    if (input[n - 2] !== undefined) report.push(`  ${this.formatNumber(n - 1, n + 2)}   ${input[n - 2]}`);

    const line = `${this.colorize("-", ColorCode.redColor, ColorCode.blueColor)} ${this.formatNumber(n + 0, n + 2)}   ${input[n - 1]}`;

    if (input[n - 1] !== undefined) report.push(this.colorize(line));

    const cursor = `  ${this.formatNumber(n + 0, n + 2).replace(/.+/g, " ")}   ${" ".repeat(m - 1)}${this.colorize("^", ColorCode.redColor)}`;

    if (input[n - 1] !== undefined) report.push(this.colorize(cursor));
    if (input[n - 0] !== undefined) report.push(`  ${this.formatNumber(n + 1, n + 2)}   ${input[n - 0]}`);
    if (input[n + 1] !== undefined) report.push(`  ${this.formatNumber(n + 2, n + 2)}   ${input[n + 1]}`);

    report.push("");

    this.storeColumn = undefined;
    return report.join("\n");
  }

  private formatNumber(num: number, offset: number) {
    const numString = num.toString();
    return " ".repeat(offset.toString().length - numString.length) + numString;
  }

  private colorize(text: string, startColor = ColorCode.blueColor, endColor = ColorCode.resetColor) {
    return `${startColor}${text}${endColor}`;
  }

  protected trackColumn() {
    this.storeColumn = this.column;
  }

  protected untrackColumn() {
    this.storeColumn = undefined;
  }
}
