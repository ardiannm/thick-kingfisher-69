import Lexer from "../Lexer";
import Token from "../tokens/basic/Token";

function InjectId(_target: Lexer, _key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function () {
    const token = originalMethod.apply(this, arguments) as Token;
    if (token.id !== undefined) return token;
    token.id = this.id;
    this.id = this.id + 1;
    return token;
  };

  return descriptor;
}

export default InjectId;
