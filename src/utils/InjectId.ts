import Lexer from "../Lexer";
import Token from "../tokens/basic/Token";
import Location from "./Location";
import Logger from "./Logger";

function InjectId(_target: Lexer, _key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function () {
    const location = { ...this.state.location } as Location;
    const token = originalMethod.apply(this, arguments) as Token;
    if (token.id !== undefined) return token;
    const id = this.state.tokenId;
    token.id = id;
    const report = new Logger(location, this.state.location);
    this.logger.set(id, report);
    this.state.tokenId = id + 1;
    return token;
  };

  return descriptor;
}

export default InjectId;
