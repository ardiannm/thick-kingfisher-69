import RuntimeValue from "./runtime.value.ts";

export default class RuntimeNumber extends RuntimeValue {
  constructor(public value: number) {
    super();
  }
}
