import Parser from "../../Parser";
import { ColorCode } from "../ParserService";

function logExecutionTime(_target: Parser, key: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const originalMethod = descriptor.value;
  descriptor.value = function (...args: any[]) {
    const start = Date.now();
    const result = originalMethod.apply(this, args);
    const end = Date.now();
    const executionTime = end - start;
    const msg = "\t".repeat(1) + `${executionTime} ms - ${this.nameSpace}.${key}`;
    console.log(this.colorize(msg, ColorCode.Blue));
    return result;
  };
  return descriptor;
}

export default logExecutionTime;
