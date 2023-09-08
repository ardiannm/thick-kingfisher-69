import System from "./System";
import SystemString from "./SystemString";

export default class SystemStringArray extends System {
  constructor(public value: Array<SystemString>) {
    super();
  }
}
