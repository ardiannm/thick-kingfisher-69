import System from "./System";
import SystemNumber from "./SystemNumber";

export default class SystemCell extends System {
  constructor(public row: number, public column: number, public value: SystemNumber, public observers: Array<string>) {
    super();
  }
}
