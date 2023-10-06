import System from "./System";
import SystemString from "./SystemString";
import SystemStringArray from "./SystemStringArray";

export default class SystemHTMLProgram extends System {
  constructor(public arr: SystemString | SystemStringArray) {
    super();
  }

  toString() {
    if (this.arr instanceof SystemString) return this.arr.toString();
    if (this.arr instanceof SystemStringArray) return this.arr.value.map((a) => a.toString());
  }
}
