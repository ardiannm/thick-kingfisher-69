import System from "./System";

export default class SystemObservable extends System {
  constructor(public value: System, public refs: Array<string>) {
    super();
  }
}
