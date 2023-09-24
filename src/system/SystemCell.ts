import System from "./System";

export default class SystemCell extends System {
  constructor(public row: number, public column: number, public view: string, public value: System) {
    super();
  }
}
