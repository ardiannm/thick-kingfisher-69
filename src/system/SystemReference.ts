import System from "./System";
import SystemNumber from "./SystemNumber";

export default class SystemReference extends System {
  constructor(public value: SystemNumber, public observers: Set<string>) {
    super();
  }
}
