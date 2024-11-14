import { TextSpan } from "../../lexing/text.span";
import { BoundKind } from "./bound.kind";

export class BoundNode {
  constructor(public kind: BoundKind, public span: TextSpan) {}
}
