import { RuntimeValue } from "./runtime.value.ts";

export class RuntimeNumber extends RuntimeValue {
  constructor(public value: number) {
    super();
  }
}
