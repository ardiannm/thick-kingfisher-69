import Token from "../tokens/basic/Token";
import Lexer from "../Lexer";

function PreserveState(_target: Lexer, _key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function () {
    const pointer = this.pointer;
    const line = this.line;
    const column = this.column;
    const id = this.id;
    const token = originalMethod.apply(this, arguments) as Token;
    this.pointer = pointer;
    this.line = line;
    this.column = column;
    this.id = id;
    return token;
  };

  return descriptor;
}

export default PreserveState;
