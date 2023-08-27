import Token from "../tokens/Token";
import Lexer from "../Lexer";

/**
 * Preserve lexer state after executing lexer methods than return tokens
 */
function Preserve(_target: Lexer, _key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function () {
    const stateSnapshot = { ...this.state };
    const token = originalMethod.apply(this, arguments) as Token;
    this.state = stateSnapshot;
    return token;
  };

  return descriptor;
}

export default Preserve;
