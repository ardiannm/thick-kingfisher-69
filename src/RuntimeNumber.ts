import RuntimeValue from "./RuntimeValue";

export default class RuntimeNumber extends RuntimeValue {
  constructor(public value: number) {
    super();
  }
}
