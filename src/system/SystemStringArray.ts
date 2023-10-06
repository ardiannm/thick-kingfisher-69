import System from "./System";
import SystemString from "./SystemString";

export default class SystemStringArray extends System {
  constructor(public value: Array<SystemString>) {
    super();
  }

  toString() {
    return this.value.map((sys) => sys.toString()).join("\n").trim();
  }
}
