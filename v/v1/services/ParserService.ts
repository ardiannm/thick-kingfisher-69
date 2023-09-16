import SyntaxToken from "../ast/tokens/SyntaxToken";
import Constructor from "./Constructor";
import Lexer from "../Lexer";
import Identifier from "../ast/expressions/Identifier";
import Color, { colorize } from "../services/Color";

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
    if (this.assert(token, tokenType)) {
      this.untrackPosition();
      return token as T;
    }
    throw this.report(message);
  }

  protected doNotExpect<T extends SyntaxToken>(token: SyntaxToken, tokenType: Constructor<T>, message: string): T {
    if (this.assert(token, tokenType)) {
      throw this.report(message);
    }
    this.untrackPosition();
    return token as T;
  }

  protected throwError(message: string) {
    throw this.report(message);
  }

  protected trackPosition() {
    this.storeLine = this.line;
    this.storeColumn = this.column;
  }

  private untrackPosition() {
    this.storeLine = undefined;
    this.storeColumn = undefined;
  }

  protected matchKeyword(keyword: string) {
    const token = this.peekToken();
    if (token instanceof Identifier) {
      if (token.view === keyword) return this.getNextToken();
    }
    return false;
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
    let start = ` - `;
    if (column > 50) start += target.substring(column - 1 - 50, column - 1).trimStart();
    else start += target.substring(0, column - 1).trimStart();
    const space = " ".repeat(start.length);
    const description = "\n" + space + `\\__ ${errorMessage}` + "\n" + space + ` \\__ at position ./${this.path}:${line}:${column}`;
    const end = target.substring(column - 1, column - 1 + 30);
    const text = start + end;
    return colorize(text, Color.Blue) + colorize(description, Color.DimSkyBlue);
  }
}
