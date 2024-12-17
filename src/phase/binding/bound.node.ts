import { Span } from "../lexing/span";
import { BoundKind } from "./bound.kind";

export class BoundNode {
  constructor(public kind: BoundKind, public span: Span) {}
}
