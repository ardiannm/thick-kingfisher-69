import Token from "../ast/tokens/Token";
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
    const input = this.input.split("\n");
    const logger = new Array<string>();
    const n = this.line;
    const m = this.column;

    logger.push("");
    logger.push(`error: ${message}`);
    logger.push(` -- dev/tests/tests.txt:${n}:${m}`);
    logger.push("");

    if (input[n - 3] !== undefined) logger.push(`   ${this.formatNumber(n - 2, n + 2)} |  ${input[n - 3]}`);
    if (input[n - 2] !== undefined) logger.push(`   ${this.formatNumber(n - 1, n + 2)} |  ${input[n - 2]}`);
    if (input[n - 1] !== undefined) logger.push(` > ${this.formatNumber(n + 0, n + 2)} |  ${input[n - 1]}`);
    if (input[n - 0] !== undefined) logger.push(`   ${this.formatNumber(n + 1, n + 2)} |  ${input[n - 0]}`);
    if (input[n + 1] !== undefined) logger.push(`   ${this.formatNumber(n + 2, n + 2)} |  ${input[n + 1]}`);

    logger.push("");

    return logger;
  }

  private formatNumber(num: number, offset: number) {
    const numString = num.toString();
    return " ".repeat(offset.toString().length - numString.length) + numString;
  }
}
