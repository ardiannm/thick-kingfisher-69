import System from "./System";

export default class SystemObservable extends System {
  constructor(public value: System, public observing: Array<string>) {
    super();
  }
}
