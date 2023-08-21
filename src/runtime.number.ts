import RuntimeValue from "./runtime.value";

export default class RuntimeNumber extends RuntimeValue {
  constructor(public value: number) {
    super();
  }
}
