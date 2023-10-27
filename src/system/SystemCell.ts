import System from "./System";
import SyntaxToken from "../ast/tokens/SyntaxToken";

export default class SystemCell extends System {
  constructor(public view: string, public value: System, public observers: Set<SyntaxToken>) {
    super();
  }
}
