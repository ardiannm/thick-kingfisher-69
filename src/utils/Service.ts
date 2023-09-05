import Token from "../tokens/basic/Token";
import Constructor from "./Constructor";
import Lexer from "../Lexer";
import Locator from "./Locator";

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
    console.log(message);
  }

  protected throw(message: string) {
    const token = this.peekToken();
    this.printf(message);
    throw token;
  }
}
