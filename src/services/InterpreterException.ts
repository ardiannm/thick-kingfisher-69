import System from "../system/System";

export default class InterpreterException extends System {
  constructor(public value: string) {
    super();
  }
}
