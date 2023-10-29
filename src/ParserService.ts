import Parser from "./Parser";
import Cell from "./ast/spreadsheet/Cell";
import SyntaxToken from "./ast/tokens/SyntaxToken";

type Constructor<Class> = new (...args: any[]) => Class;

const ParserService = () => {
  const assert = <T extends SyntaxToken>(instance: SyntaxToken, tokenType: Constructor<T>): boolean => {
    return instance instanceof tokenType;
  };

  const expect = <T extends SyntaxToken>(token: SyntaxToken, tokenType: Constructor<T>, message: string): T => {
    if (assert(token, tokenType)) {
      return token as T;
    }
    throw message;
  };

  const doNotExpect = <T extends SyntaxToken>(token: SyntaxToken, tokenType: Constructor<T>, message: string): T => {
    if (assert(token, tokenType)) {
      throw message;
    }
    return token as T;
  };

  const throwError = (message: string) => {
    throw message;
  };

  const extractRefs = (input: string) => {
    const refs = new Array<string>();
    const parser = Parser(input);
    while (parser.hasMoreTokens()) {
      const token = parser.parseCell();
      if (token instanceof Cell && !refs.includes(token.view)) refs.push(token.view);
    }
    return refs;
  };

  return { expect, doNotExpect, throwError, extractRefs };
};

export default ParserService;
