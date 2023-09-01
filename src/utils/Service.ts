import Token from "../tokens/basic/Token";
import Constructor from "./Constructor";
import Lexer from "../Lexer";
import Printf from "./Printf";
import Location from "./Location";

export default class Service extends Lexer {
  //

  private assert<T extends Token>(instance: Token, tokenType: Constructor<T>): boolean {
    return instance instanceof tokenType;
  }

  protected expect<T extends Token>(token: Token, tokenType: Constructor<T>, message: string): T {
    if (this.assert(token, tokenType)) return token as T;
    this.printf(token, message);
    throw token;
  }

  protected doNotExpect<T extends Token>(token: Token, tokenType: Constructor<T>, message: string): T {
    if (this.assert(token, tokenType)) {
      this.printf(token, message);
      throw token;
    }
    return token as T;
  }

  protected printf(token: Token, message: string) {
    const target = this.tokenStates.get(token.id as number);
    if (target) target.printf(this.input, message);
    const location = new Location(this.line, this.column);
    new Printf(location).printf(this.input, `for some reason token with id \`${token.id}\` has not been mapped in the token states`);
  }

  protected throw(message: string) {
    const token = this.getNextToken();
    this.printf(token, message);
    throw token;
  }
}
