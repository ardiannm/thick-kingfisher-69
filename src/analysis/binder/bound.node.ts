import { Span } from "../text/span";
import { BoundKind } from "./kind/bound.kind";

export abstract class BoundNode {
  constructor(public kind: BoundKind, public span: Span) {}
}
