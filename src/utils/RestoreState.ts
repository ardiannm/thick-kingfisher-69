  import Token from "../tokens/basic/Token";
  import Lexer from "../Lexer";

  function RestoreState(_target: Lexer, _key: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function () {
      const stateSnapshot = { ...this.state, location: { ...this.state.location } };
      const token = originalMethod.apply(this, arguments) as Token;
      this.state = stateSnapshot;

      return token;
    };

    return descriptor;
  }

  export default RestoreState;
