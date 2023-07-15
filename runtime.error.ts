import { RuntimeValue } from "./runtime.value.ts";

export class RuntimeError extends RuntimeValue {
  constructor(public message: string) {
    super();
  }
}
