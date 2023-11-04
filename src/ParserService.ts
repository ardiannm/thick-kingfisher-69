import SyntaxToken from "./ast/tokens/SyntaxToken";

type Constructor<Class> = new (...args: any[]) => Class;

function ParserService() {
  function assert<T extends SyntaxToken>(instance: SyntaxToken, tokenType: Constructor<T>): boolean {
    return instance instanceof tokenType;
  }

  function expect<T extends SyntaxToken>(token: SyntaxToken, tokenType: Constructor<T>, message: string): T {
    if (assert(token, tokenType)) {
      return token as T;
    }
    throw message;
  }

  function doNotExpect<T extends SyntaxToken>(token: SyntaxToken, tokenType: Constructor<T>, message: string): T {
    if (assert(token, tokenType)) {
      throw message;
    }
    return token as T;
  }

  function throwError(message: string) {
    throw message;
  }

  return { expect, doNotExpect, throwError };
}

export default ParserService;
