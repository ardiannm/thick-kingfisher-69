import System from "./System";
import SystemCell from "./SystemCell";

export default class SystemRange extends System {
  constructor(public row: SystemCell, public column: SystemCell) {
    super();
  }
}
