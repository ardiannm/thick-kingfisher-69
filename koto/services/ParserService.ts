import SyntaxToken from "../ast/tokens/SyntaxToken";
import Constructor from "./Constructor";
import Lexer from "../Lexer";

enum ColorCode {
  Red = `\x1b[31m`,
  Blue = `\x1b[38;2;86;156;214m`,
  White = `\x1b[0m`,
  Green = `\x1b[38;2;78;201;176m`,
  Yellow = `\x1b[38;2;215;186;125m`,
  Brown = `\x1b[38;2;206;145;120m`,
}

export default class ParserService extends Lexer {
  private storeLine?: number;
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

  protected trackPosition() {
    this.storeLine = this.line;
    this.storeColumn = this.column;
  }

  protected untrackPosition() {
    this.storeLine = undefined;
    this.storeColumn = undefined;
  }

  protected report(errorMessage: string) {
    const input = this.input.split("\n");

    const line = this.storeLine || this.line;
    const column = this.storeColumn || this.column;

    const report = new Array<string>();

    report.push("");
    report.push("");

    report.push(this.displayLine(input, line, column, errorMessage));

    report.push("");

    this.storeColumn = undefined;
    return report.join("\n");
  }

  private displayLine(input: Array<string>, line: number, column: number, errorMessage: string) {
    let target = input[line - 1];
    let textContent = "";
    if (column > 50) textContent += target.substring(column - 1 - 40, column - 1);
    else textContent += target.substring(0, column - 1);
    const lineNumber = `-- ${line} -- `;
    const space = " ".repeat(textContent.length + lineNumber.length);
    const description = "\n" + space + `\\__ ${errorMessage}` + "\n" + space + ` \\__ ./${this.path}:${line}:${column}`;
    const format = this.colorize(lineNumber, ColorCode.Yellow, ColorCode.Blue) + textContent + target.substring(column - 1, column - 1 + 30) + this.colorize(description, ColorCode.Yellow);
    return this.colorize(format, ColorCode.Blue);
  }

  private colorize(text: string, startColor: ColorCode, endColor = ColorCode.White) {
    return `${startColor}${text}${endColor}`;
  }
}
