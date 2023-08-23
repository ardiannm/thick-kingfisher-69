import Token from "./Token";
import Lexer from "./Lexer";

/**
 * Generates and injects an unique id for the token
 * @returns Token with newly injected id for the next generation
 */
function TokenId(_target: Lexer, _key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function () {
    const token = originalMethod.apply(this, arguments) as Token;
    token.token = this.state.tokenId;
    this.state.tokenId = this.state.tokenId + 1;
    return token;
  };

  return descriptor;
}

export default TokenId;
