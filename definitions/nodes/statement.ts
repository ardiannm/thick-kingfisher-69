import { Node } from "../node.definition.ts";

export class StatementNode extends Node {
  constructor(public statments: Array<Node>) {
    super();
  }
}
