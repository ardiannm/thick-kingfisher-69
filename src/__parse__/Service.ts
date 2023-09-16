import SyntaxToken from "../ast/tokens/SyntaxToken";
import Constructor from "../services/Constructor";

const Service = () => {
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

  return { expect, doNotExpect, throwError };
};

export default Service;
