import SyntaxToken from "../ast/tokens/SyntaxToken";
import Constructor from "./Constructor";
import Lexer from "../Lexer";
import UsingKeyword from "../ast/expressions/UsingKeyword";
import DoctypeKeyword from "../ast/expressions/DoctypeKeyword";
import Identifier from "../ast/expressions/Identifier";

export default class Service extends Lexer {
  private storeColumn?: number;

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
    report.push(` -- dev/tests/parse_html_content.code:${n}:${m}`);
    report.push("");

    if (input[n - 3] !== undefined) report.push(`  ${this.formatNumber(n - 2, n + 2)}   ${input[n - 3]}`);
    if (input[n - 2] !== undefined) report.push(`  ${this.formatNumber(n - 1, n + 2)}   ${input[n - 2]}`);

    const line = `${this.colorize("-", 31, 34)} ${this.formatNumber(n + 0, n + 2)}   ${input[n - 1]}`;

    if (input[n - 1] !== undefined) report.push(this.colorize(line));

    const cursor = `  ${this.formatNumber(n + 0, n + 2).replace(/.+/g, " ")}   ${" ".repeat(m - 1)}${this.colorize("^", 31)}`;

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

  private colorize(text: string, colorCode = 34, endsWith = 0) {
    const greenColor = `\x1b[${colorCode}m`; // 32 represents green color code
    const resetColor = `\x1b[${endsWith}m`; // Reset color to default
    return `${greenColor}${text}${resetColor}`;
  }

  protected trackColumn() {
    this.storeColumn = this.column;
  }

  protected untrackColumn() {
    this.storeColumn = undefined;
  }
}
