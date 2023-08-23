import Token from "./Token";
import Lexer from "./Lexer";
import Constructor from "./Constructor";

/**
 *
 */
function Register<T extends Token>(tokenType: Constructor<T>) {
  return function (_target: Lexer, _key: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function () {
      const token = originalMethod.apply(this, arguments) as Token;
      if (tokenType && token instanceof tokenType) {
        token.token = this.state.tokenId;
        this.state.tokenId = this.state.tokenId + 1;
      }
      return token;
    };

    return descriptor;
  };
}

export default Register;
