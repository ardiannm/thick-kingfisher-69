import Token from "../ast/tokens/Token";
import Parser from "../Parser";

function Inject(_target: Parser, _propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const token = originalMethod.apply(this, args) as Token;
    if (token.id !== undefined) return token;
    token.id = this.id;
    this.id = this.id + 1;
    return token;
  };

  return descriptor;
}

export default Inject;
