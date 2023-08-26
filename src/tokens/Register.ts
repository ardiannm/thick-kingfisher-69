import Token from "./Token";
import Lexer from "../Lexer";
import StateMachine from "./StateMachine";
import Logger from "../Logger";

function Register(_target: Lexer, _key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function () {
    const state = { ...this.state } as StateMachine;
    const token = originalMethod.apply(this, arguments) as Token;
    if (token.id) return token;
    const id = this.state.tokenId;
    token.id = id;
    this.logger.set(id, new Logger(state.lineStart, state.pointer, this.state.pointer));
    this.state.tokenId = id + 1;
    return token;
  };

  return descriptor;
}

export default Register;
