import Lexer from "../Lexer";
import Token from "../tokens/basic/Token";
import Location from "./Location";
import Printf from "./Printf";

function InjectId(_target: Lexer, _key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function () {
    const line = this.line;
    const column = this.column;
    const token = originalMethod.apply(this, arguments) as Token;
    if (token.id !== undefined) return token;
    const id = this.id;
    token.id = id;
    const report = new Printf(new Location(line, column), new Location(this.line, this.column));
    this.tokenStates.set(id, report);
    this.id = id + 1;
    return token;
  };

  return descriptor;
}

export default InjectId;
