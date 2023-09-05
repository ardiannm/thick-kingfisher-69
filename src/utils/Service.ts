import Token from "../tokens/basic/Token";
import Constructor from "./Constructor";
import Lexer from "../Lexer";

export default class Service extends Lexer {
  private assert<T extends Token>(instance: Token, tokenType: Constructor<T>): boolean {
    return instance instanceof tokenType;
  }

  protected expect<T extends Token>(token: Token, tokenType: Constructor<T>, message: string): T {
    if (this.assert(token, tokenType)) return token as T;
    throw this.format(message);
  }

  protected doNotExpect<T extends Token>(token: Token, tokenType: Constructor<T>, message: string): T {
    if (this.assert(token, tokenType)) {
      throw this.format(message);
    }
    return token as T;
  }

  protected throwError(message: string) {
    throw this.format(message);
  }

  private format(message: string) {
    const lineNumber = this.line;
    const lineContent = this.input.split("\n")[lineNumber - 1];
    const logger = new Array<string>();

    logger.push("");
    logger.push(`error: ${message}`);
    logger.push(` -- ./dev/tests/tests.txt:${lineNumber}:1`);
    logger.push("");
    logger.push(`  ${lineNumber - 1}  |  `);
    logger.push(`> ${lineNumber}  |  ${lineContent}`);
    logger.push(`  ${lineNumber + 1}  |  `);
    logger.push("");

    return logger;
  }
}
