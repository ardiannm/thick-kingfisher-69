import Lexer from "../Lexer";
import Token from "../tokens/basic/Token";
import StateMachine from "./StateMachine";
import TokenInfo from "./TokenInfo";

function InjectId(_target: Lexer, _key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function () {
    const state = { ...this.state } as StateMachine;
    const token = originalMethod.apply(this, arguments) as Token;
    if (token.id !== undefined) return token;
    const id = this.state.tokenId;
    token.id = id;
    const err = new TokenInfo(state.lineStart, state.pointer, this.state.pointer);
    this.logger.set(id, err);
    this.state.tokenId = id + 1;
    return token;
  };

  return descriptor;
}

export default InjectId;
