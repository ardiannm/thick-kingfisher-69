import System from "./System";

export default class SystemObservable extends System {
  constructor(public value: System, public textFormula: string, public refs: Array<string>) {
    super();
  }
}
