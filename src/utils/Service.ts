import Token from "../tokens/basic/Token";
import Constructor from "./Constructor";
import Lexer from "../Lexer";

export default class Service extends Lexer {
  private space = false;

  protected considerSpace() {
    this.space = true;
  }

  protected ignoreSpace() {
    this.space = false;
  }

  protected whiteSpace() {
    return this.space;
  }

  private assert<T extends Token>(instance: Token, tokenType: Constructor<T>): boolean {
    return instance instanceof tokenType;
  }

  protected expect<T extends Token>(token: Token, tokenType: Constructor<T>, message: string): T {
    if (this.assert(token, tokenType)) return token as T;
    this.printf(message);
    throw token;
  }

  protected doNotExpect<T extends Token>(token: Token, tokenType: Constructor<T>, message: string): T {
    if (this.assert(token, tokenType)) {
      this.printf(message);
      throw token;
    }
    return token as T;
  }

  protected printf(message: string) {
    console.log();
    console.log(`error: ${message}`);
    console.log(` -- ./dev/tests/tests.txt:${this.line}:1`);
    console.log();
    this.renderLine(this.line);
    console.log();
  }

  private renderLine(lineNumber: number) {
    const lines = this.input.split("\n");

    console.log(lines);

    const lineContent = lines[lineNumber - 1];
    const lineNumberWidth = this.line.toString().replace(/.+/g, " ");

    console.log(`${lineNumberWidth}  |  `);
    console.log(`${lineNumber}  |  ${lineContent}`);
    console.log(`${lineNumberWidth}  |  `);
  }

  protected throw(message: string) {
    this.printf(message);
    throw "";
  }
}
