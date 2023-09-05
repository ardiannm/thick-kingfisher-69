import Token from "../tokens/basic/Token";
import Constructor from "./Constructor";
import Lexer from "../Lexer";
import Locator from "./Locator";

export default class Service extends Lexer {
  private space = false;

  protected keepSpace() {
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
    new Locator(this.line, this.column, this.line, this.column).printf(this.input, message);
  }

  protected throw(message: string) {
    const token = this.getNextToken();
    this.printf(message);
    throw token;
  }
}
