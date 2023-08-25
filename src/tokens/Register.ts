import Token from "./Token";
import Lexer from "../Lexer";
import Constructor from "./Constructor";

function Register<T extends Token>(tokenType: Constructor<T>) {
  return function (_target: Lexer, _key: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function () {
      const token = originalMethod.apply(this, arguments) as Token;
      if (token instanceof tokenType) {
        const id = this.state.tokenId;
        token.token = id;
        this.state.tokenId = id + 1;
      }
      return token;
    };

    return descriptor;
  };
}

export default Register;
